📘 Atualização da Documentação

Projeto: Phinancie-Mobile

Este documento apresenta a revisão realizada sobre os arquivos de documentação existentes no aplicativo Phinanciê – Sistema de Gestão Financeira Pessoal, assim como as propostas de melhoria e padronização para consolidar a estrutura documental do projeto.
O objetivo é organizar os artefatos, melhorar a rastreabilidade, facilitar a manutenção e preparar o projeto para crescimento contínuo.

1. Análise dos Arquivos Existentes

Após revisar a estrutura atual do repositório, identifiquei os seguintes arquivos e pastas relevantes:

Documentação já existente

README.md

Documento de Requisitos.md

Plano de Software.md

Plano de Garantia da Qualidade de Software (PGQS).md

Phinancie-Mobile-DAS.md

Plano_de_testes.xlsx

Códigos e diretórios relevantes

backend/

frontend/

Esses elementos já formam uma boa base de documentação, mas há necessidade de centralizar, atualizar e padronizar para melhorar a manutenção e facilitar o acesso às informações.

2. Objetivos da Atualização

A atualização proposta tem como metas principais:

Centralizar e indexar todos os artefatos existentes e novos em uma estrutura clara dentro de /docs.

Adicionar histórico de versões em todos os documentos principais (data, autor, descrição das mudanças).

Criar links diretos entre documentos (ex.: requisitos → testes → plano de software).

Atualizar instruções de execução e build do backend e frontend.

Integrar o Plano_de_testes.xlsx ao PGQS, incluindo um resumo de cobertura e status.

Criar controle de documentação com checklist e changelog simples para futuras atualizações.

3. Propostas de Atualização por Arquivo
📄 README.md

Adicionar um sumário com links rápidos para toda a documentação.

Criar seção “Artefatos e Documentação” com índice geral.

Atualizar instruções de instalação, build e execução para frontend e backend.

Incluir dependências e ferramentas necessárias.

📄 Documento de Requisitos.md

Atualizar o Histórico de Versões.

Adicionar referências cruzadas:

protótipos

casos de teste

entregáveis relacionados

Verificar necessidade de incluir requisitos não funcionais (performance, segurança, acessibilidade).

📄 Plano de Software.md

Checar se a arquitetura documentada representa o código atual.

Atualizar diagramas, se necessário.

Incluir instruções de deploy (backend e mobile).

Acrescentar referências para as APIs e endpoints usados pelo app.

📄 Plano de Garantia da Qualidade (PGQS).md

Adicionar um resumo do Plano de Testes, indicando:

total de casos

funcionalidades cobertas

criticidade

Criar seção Status dos Testes, com link para a planilha atualizada.

Incluir instruções sobre onde colocar evidências de testes (prints, logs, relatórios de CI).

📄 Plano_de_testes.xlsx

Recomendações:

Adicionar colunas:

Status (Pendente / Em Execução / Executado / Bloqueado)

Responsável

Data de Execução

Se necessário, posso gerar uma nova versão com o layout atualizado.

📄 Phinancie-Mobile-DAS.md

Atualizar lista de entregáveis.

Incluir novos documentos criados.

Atualizar datas e versões.

4. Novo Arquivo Proposto — Índice Geral de Artefatos

Sugestão de criação do arquivo:

📄 docs/ARTIFACTS.md

# Índice de Artefatos e Documentação — Phinancie-Mobile

Este documento centraliza todos os artefatos do projeto, facilitando navegação e manutenção.

## Documentos principais
- README.md — Visão geral, setup e links principais.
- Documento de Requisitos.md — Requisitos funcionais e não funcionais.
- Plano de Software.md — Arquitetura, componentes e deploy.
- Plano de Garantia da Qualidade (PGQS).md — Estratégias de testes e QA.
- Phinancie-Mobile-DAS.md — Documento de Análise de Sistema.

## Artefatos complementares
- Plano_de_testes.xlsx — Casos de teste e cronograma.
- backend/ — Código do backend (APIs, serviços, autenticação).
- frontend/ — Código do aplicativo mobile.

## Recomendações para manutenção
1. Manter histórico de versões em cada documento.
2. Manter evidências e arquivos auxiliares na pasta `/docs`.
3. Atualizar comandos do README sempre que houver mudança no ambiente.
4. Criar e manter um CHANGELOG.md na raiz do repositório.

## Contato e responsabilidade
Responsáveis pela documentação:  
(preencher)

5. Próximos Passos Propostos

As próximas ações recomendadas para manter a documentação organizada:

✔ Criar branch de atualização

Sugerido:
docs/update-2025-12-08

✔ Alterações que serão incluídas

Adicionar docs/ARTIFACTS.md

Atualizar o README com novo índice de documentos

Revisar e adicionar histórico de versão nos arquivos principais

Atualizar referências cruzadas entre requisitos, testes e arquitetura

✔ Alterações opcionais

Atualizar e reorganizar o Plano_de_testes.xlsx

Criar um CHANGELOG.md

Revisar completamente o DAS

6. Conclusão

Com esta atualização, o projeto Phinancie-Mobile passa a ter uma documentação mais organizada, rastreável e consistente.
A centralização dos artefatos e a criação de históricos e índices facilitam o trabalho de desenvolvimento, QA e evolução do projeto a longo prazo.