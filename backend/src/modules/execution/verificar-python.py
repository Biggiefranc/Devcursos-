import contextlib
import io
import json
import traceback

class SaidaLimitada(io.StringIO):
    def write(self, texto):
        if self.tell() + len(texto) > 8000:
            raise RuntimeError("A saída é muito longa. Reduza os prints e tente novamente.")
        return super().write(texto)

def executar(codigo, configuracao):
    dados = json.loads(configuracao)
    resultados = []
    programa = compile(codigo, "<seu código>", "exec")

    for caso in dados["casos"]:
        captura = SaidaLimitada()
        entradas = iter(caso.get("entradas", []))

        def ler_entrada(prompt=""):
            try:
                return str(next(entradas))
            except StopIteration:
                raise EOFError("Seu código pediu mais entradas do que o caso fornece.") from None

        escopo = {"__name__": "__main__", "input": ler_entrada}
        try:
            with contextlib.redirect_stdout(captura), contextlib.redirect_stderr(captura):
                exec(programa, escopo)
                if dados["tipo"] == "funcao":
                    nome = dados["nomeFuncao"]
                    funcao = escopo.get(nome)
                    if not callable(funcao):
                        raise NameError(f"Defina uma função chamada {nome}.")
                    valor = funcao(*caso["argumentos"])
                else:
                    valor = captura.getvalue()
            item = {"valor": valor}
            serializado = json.dumps(item, ensure_ascii=False, allow_nan=False)
            if len(serializado) > 12000:
                raise ValueError("O resultado é grande demais para a correção.")
            resultados.append(item)
        except Exception as erro:
            detalhe = "".join(traceback.format_exception(erro, limit=-3))
            resultados.append({"erro": detalhe[-4000:]})
    return json.dumps(resultados, ensure_ascii=False, allow_nan=False)
