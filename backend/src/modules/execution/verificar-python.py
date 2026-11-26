import contextlib
import io
import json
import runpy
import sys


class SaidaLimitada(io.StringIO):
    def write(self, texto):
        if self.tell() + len(texto) > 8000:
            raise RuntimeError("A saída é muito longa. Reduza os prints e tente novamente.")
        return super().write(texto)


def observar(caso):
    entradas = iter(caso.get("entradas", []))

    def ler_entrada(prompt=""):
        try:
            return str(next(entradas))
        except StopIteration:
            raise EOFError("Seu código pediu mais entradas do que o caso fornece.") from None

    captura = SaidaLimitada()
    with contextlib.redirect_stdout(captura), contextlib.redirect_stderr(captura):
        escopo = runpy.run_path("submissao.py", init_globals={"input": ler_entrada}, run_name="__main__")
        if caso["tipo"] == "funcao":
            nome = caso["nomeFuncao"]
            funcao = escopo.get(nome)
            if not callable(funcao):
                raise NameError(f"Defina uma função chamada {nome}.")
            return funcao(*caso["argumentos"])
        return captura.getvalue()


# Este processo só devolve o valor observado. A API corrige o caso.
valor = observar(json.load(sys.stdin))
serializado = json.dumps(valor, ensure_ascii=False, allow_nan=False)
if len(serializado) > 12000:
    raise ValueError("O resultado é grande demais para a correção.")
print(serializado)
