# Frontend Engineering & Design System Rules

Antes de gerar ou alterar qualquer arquivo de UI, leia e aplique estritamente as skills em `.codex/skills/`:
1. `design-tokens-and-brand.md`
2. `layout-architecture.md`
3. `motion-and-microinteractions.md`

## Regras Absolutas (Zero Tolerância)
- NUNCA use layouts genéricos de 3 cards centralizados com ícones soltos.
- NUNCA use roxo neon (`#A855F7` / `purple-500`) sobre fundo branco ou preto puro. Use a escala cromática definida nos tokens.
- Use `backdrop-blur` EXCLUSIVAMENTE na navbar fixa, modais e menus flutuantes (padrão Apple HIG). Cards de conteúdo devem ter superfícies sólidas ou com gradiente sutil de 2% de opacidade.
- Todo card de curso/trilha deve exibir metadados técnicos (nível, horas, tecnologias, projeto final) em fonte monoespaçada.
