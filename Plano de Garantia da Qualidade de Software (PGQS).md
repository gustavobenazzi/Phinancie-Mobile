# ☑️ Plano de Garantia da Qualidade de Software (PGQS)

Este documento define as atividades, procedimentos, padrões e métricas de qualidade que serão aplicados no desenvolvimento do aplicativo **Phinanciê – Sistema de Gestão Financeira Pessoal**, garantindo conformidade com os requisitos estabelecidos e promovendo melhoria contínua ao longo do projeto.

---

## 🎯 OBJETIVOS DE QUALIDADE

Durante o desenvolvimento do projeto, os seguintes objetivos orientarão a garantia da qualidade:

- Garantir que todas as funcionalidades do MVP atendam aos requisitos funcionais e não funcionais do Documento de Requisitos.
- Assegurar que o software seja confiável, seguro e com desempenho adequado em dispositivos mobile.
- M a nter o código limpo, modular e documentado, seguindo boas práticas e padrões definidos pela equipe.
- Reduzir e controlar a dívida técnica por meio de revisões, checklist e acompanhamento contínuo.
- Garantir que todas as entregas sigam o processo estabelecido no Kanban e nas definições de pronto (DoD).
- Assegurar que o produto final seja testado, validado e rastreável até os requisitos.

---

## 📜 NORMAS, PADRÕES E REFERÊNCIAS

O desenvolvimento do projeto seguirá as seguintes normas e boas práticas:

- **MPS.BR** – Guia de Qualidade e Desenvolvimento de Software  
- **ISO/IEC 25010** – Modelo de Qualidade de Produto de Software  
- **ISO/IEC 12207** – Processos de Ciclo de Vida de Software  
- Boas práticas de desenvolvimento utilizando **React Native**, **Node.js** e **Prisma**  
- Padrões de versionamento **Git Flow adaptado**  
- Padrões de documentação adotados pelo grupo (Markdown, README, PS, DR, PGQS, DAS)

---

## 👤 ORGANIZAÇÃO E RESPONSABILIDADES

| Função                    | Nome(s)                                | Responsabilidades em relação à qualidade |
|---------------------------|-----------------------------------------|------------------------------------------|
| Líder de projeto / PO     | Fernando Vassoler Nunes                | Coordenar o projeto, validar entregas, revisar cronograma, remover impedimentos, revisar processos |
| Desenvolvedores           | Gabriel Adolf Worm, Gustavo Matos Benazzi | Implementar padrões de código, registrar dívida técnica, testar funcionalidades, participar de revisões |
| Testadores / QA           | Gustavo Matos Benazzi (+ desenvolvedores) | Criar e executar testes funcionais e de integração, relatar defeitos, validar correções |
| Analistas de Documentação | Amanda Lais Gerhard, Suziane Marques, Muryllo Teixeira | Atualizar documentação (DR, PS, DAS, PGQS), manter padronização e rastreabilidade |

---

## 🎖️ PROCESSOS DE GARANTIA DA QUALIDADE

### ✔ Revisões de código

- Todo código será versionado no GitHub.  
- Cada funcionalidade deve passar por auto-revisão antes do commit.  
- Uso de checklist de qualidade antes de finalizar PRs:

  - Código limpo e legível  
  - Testado manualmente  
  - Sem `console.log` ou prints desnecessários  
  - Componentes reutilizáveis  
  - Tratamento de erros implementado  
  - Padrão de branches: `main`, `dev`, `feature/**`.

---

### ✔ Confiabilidade

Para garantir confiabilidade:

- Testes manuais de fluxo principal:  
  - login  
  - registro de transações  
  - visualização de relatórios  
- Tratamento de erros e exceções no backend (Node.js).  
- Salvamento seguro e consistente usando Prisma.  
- Backup automático do banco de dados (conforme requisitos).  
- Garantir que o app não quebre mesmo sem internet (fallback básico).

---

### ✔ Dívida técnica

A dívida técnica será controlada através de:

- Registro no **GitHub Projects** com coluna específica “Dívida Técnica”.
- Classificação da dívida:

  - **Baixa:** não impede entregas  
  - **Média:** causa impacto moderado  
  - **Alta:** impede funcionalidades essenciais  

- Revisões quinzenais.  
- Correções adicionadas ao Kanban como tarefas regulares.

---

### ✔ Métricas de qualidade

As métricas utilizadas serão:

- Cobertura mínima de testes manuais: **100% dos fluxos críticos**.  
- Velocidade de entrega: quantidade de cards concluídos por semana.  
- Quantidade de bugs por entrega: monitoramento a cada release.  
- Taxa de retrabalho: tarefas reabertas no Kanban.  
- Conformidade com o DoD: checklist aplicado antes de cada entrega.

---

### ✔ Segurança e riscos

- Criptografia dos dados sensíveis (RNF-01).  
- Autenticação com 2FA ou reforço com JWT.  
- Prevenção contra vazamento de credenciais no GitHub.  
- Uso de variáveis de ambiente.

**Principais riscos:**
- Atrasos no desenvolvimento  
- Falhas de integração  
- Perda de dados  
- Complexidade da importação de extratos OFX  

---

### ✔ Controle de qualidade

- Verificação semanal do Kanban.  
- Comparação planejado x realizado no cronograma.  
- Revalidação dos requisitos após cada incremento.  
- Testes de aceitação baseados no Documento de Requisitos.  
- Atualização contínua do PGQS, PS e DR conforme evolução do projeto.

---

## 🛠️ FERRAMENTAS DE APOIO

A garantia da qualidade será apoiada pelas seguintes ferramentas:

- GitHub – versionamento, issues, PRs e Kanban  
- Visual Studio Code – desenvolvimento  
- React Native – app mobile  
- Node.js + Prisma – backend  
- PostgreSQL – banco de dados  
- Figma – prototipação  
- ESLint/Prettier – padronização de código  

---

## 📈 ESTRATÉGIAS DE MELHORIA CONTÍNUA

- Aplicação do ciclo **PDCA** a cada sprint ou entrega parcial.  
- Retrospectivas semanais para avaliar falhas e melhorias.  
- Revisão contínua do Kanban e reorganização de prioridades.  
- Revisão de padrões internos conforme novas tecnologias são adotadas.  
- Atualização dos documentos estratégicos (PS, PGQS, DR, DAS) conforme evolução.

---

## 🌟 CRITÉRIOS DE ACEITAÇÃO DA QUALIDADE

Para que o software seja considerado de qualidade, ele deve:

- Atender a todos os requisitos do MVP.  
- Passar nos testes funcionais definidos.  
- Atender aos critérios de segurança.  
- Estar coerente com o design do Figma.  
- Cumprir o DoD:  
  - Funcional  
  - Testado  
  - Documentado  
  - Sem bugs críticos  
- Ser entregue dentro dos prazos definidos.

---
