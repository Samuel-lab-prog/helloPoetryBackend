# Baseline de validação — Etapa 0

Registro das falhas já observadas antes da Etapa 1. Não representa validação
atual nem autoriza ignorar falhas futuras.

## Backend

- `lint`: cinco erros e dois avisos preexistentes.
- `format`: 20 arquivos fora do padrão.
- `typecheck`: bloqueado por `TS5101`, relacionado à depreciação de `baseUrl` na
  configuração atual do TypeScript.
- dependency-cruiser: dois avisos e nenhum erro.
- `check:env:dev`: validação inicial de configuração passou; verificação de
  isolamento bloqueada pela ausência de `.env.test`, sem conexão ao banco.
- `check:static` anterior executava geração do Prisma e barrels, correções
  automáticas de lint e formatação e geração de métricas; não era um check não
  mutável.

## Escopo da Etapa 1

Os scripts de check agora se limitam a verificações estáticas. Geração, build,
métricas, testes e checks de ambiente/banco continuam disponíveis como comandos
próprios, fora do fluxo não mutável. Nenhuma migration ou operação de banco deve
ser executada por `check` ou `check:static`.

Os agregadores `check:test`, `check:prod` e `check:all` não chamam build nem os
testes de integração/E2E que preparam o banco. Os comandos explícitos
`test:all`, `test:integration` e `test:e2e` continuam preparando o banco de
teste; use-os somente quando essa operação for intencional.
