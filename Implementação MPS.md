# 📘 Documentação — Implementação MPS.br

**Projeto: Phinancie-Mobile**

## 1. Introdução

Este documento apresenta o diagnóstico inicial do projeto **Phinancie-Mobile** e o plano estruturado para implantação das práticas do **MPS.br**, com foco no **Nível G**.
A análise abrangeu os artefatos já existentes no repositório, as lacunas identificadas e os documentos e processos que precisam ser estabelecidos para que o projeto alcance conformidade com o modelo.

O objetivo é organizar os processos, padronizar a documentação e criar uma base sólida de rastreabilidade, medição, qualidade e gestão de configuração.

---

## 2. Diagnóstico Inicial do Projeto

Durante a revisão do repositório, identifiquei os seguintes artefatos e sua relevância no contexto do MPS.br:

### **2.1 Artefatos já existentes**

| Artefato                                 | Localização | Contribuição para o MPS.br                                        |
| ---------------------------------------- | ----------- | ----------------------------------------------------------------- |
| Documento de Requisitos.md               | /docs       | Evidência parcial de **GRE – Gerência de Requisitos**             |
| Plano de Software.md                     | /docs       | Base para **GPR – Gerência de Projetos**                          |
| Plano de Garantia da Qualidade (PGQS).md | /docs       | Evidência de **GQA – Garantia da Qualidade**                      |
| Plano_de_testes.xlsx                     | /docs       | Evidência de **VER – Verificação**                                |
| backend/ e frontend/                     | raiz        | Estrutura de código, base para **GCO – Gerência de Configuração** |
| README.md                                | raiz        | Visão geral do projeto                                            |
| package.json                             | raiz        | Base inicial para automação e CI/CD                               |

---

## 3. Mapeamento para os Processos do MPS.br

Com base nos documentos analisados, identifiquei o seguinte nível de aderência aos processos do MPS.br:

### **GRE – Gerência de Requisitos**

Há um documento de requisitos, porém ainda não existe rastreabilidade formal com casos de teste ou entregas.

### **GPR – Gerência de Projetos**

O Plano de Software já contribui para o processo, mas precisa de maior detalhamento em cronograma, riscos, recursos e papéis.

### **GQA – Garantia da Qualidade**

O PGQS está presente, mas faltam evidências práticas de execução e coleta de resultados.

### **VER – Verificação**

Existe o plano de testes, mas não há relatórios ou histórico de execuções.

### **GCO – Gerência de Configuração**

A estrutura do repositório é organizada, porém sem uma política formal de versionamento, branching e baselines.

---

## 4. Lacunas Identificadas (Gap Analysis)

### **Documentos ainda ausentes**

* Rastreabilidade entre requisitos e casos de teste.
* Plano formal de **Gerência de Configuração (GCO)**.
* Plano de **Medição (MED)**.
* Registros formais: atas, revisões, não conformidades.
* Papéis e responsabilidades documentados.
* Checklists de inspeção, revisão e auditoria.

### **Evidências pendentes**

* Resultados de testes e relatórios.
* Histórico de builds e testes automatizados (CI).
* Baselines, versões e controle de mudanças.
* Métricas reais coletadas do projeto.

---

## 5. Plano de Ação para Implementação do MPS.br

### **Passos principais**

1. Realizar gap analysis detalhada com foco no Nível G.
2. Criar os artefatos obrigatórios:

   * Plano de Gestão de Configuração (GCO)
   * Plano de Medição (MED)
   * Plano de Implementação MPS.br
   * Checklists oficiais
3. Estruturar diretório de evidências:

```
/mpsbr/
   /planos
   /checklists
   /evidencias
```

4. Implementar CI/CD básica com:

   * Build
   * Testes automatizados
   * Relatórios de cobertura

5. Registrar evidências a cada entrega:

   * atas
   * relatórios de testes
   * baseline (tag)
   * checklist preenchido
   * métricas atualizadas

---

## 6. Estrutura de Diretórios Recomendada

```
/mpsbr
   README-mpsbr.md
   Plano-de-Implementacao-MPSBR.md
   Plano-de-Gestao-de-Configuracao.md
   Plano-de-Medicao.md
   Checklist-Evidencias.md

   /evidencias
       /YYYY-MM-DD-nome-entrega

   /planos
   /checklists
```

---

## 7. Templates Recomendados

### **7.1 README-mpsbr.md**

```markdown
# Implementação MPS.br — Phinancie-Mobile

Este diretório reúne os artefatos, planos e evidências referentes à adoção das práticas do MPS.br no projeto.

Escopo do Nível G:
- GRE
- GPR
- GCO
- GQA
- VER
- MED

Responsáveis:
- Gerente do Projeto: (preencher)
- Responsável Técnico: (preencher)
- QA: (preencher)
```

---

### **7.2 Plano de Implementação MPSBR**

```markdown
# Plano de Implementação — MPS.br

Objetivo  
Estabelecer as atividades, responsáveis e cronograma para adoção do MPS.br Nível G no projeto Phinancie-Mobile.

Atividades:
1. Gap Analysis  
2. Criação dos planos GCO e MED  
3. Implementação da política de branching  
4. Configuração da pipeline de CI  
5. Registro e análise das métricas  
6. Auditoria interna  

Riscos:
- Baixa disponibilidade da equipe
- Poucas métricas históricas

Mitigação:
- Iniciar métricas a partir do marco zero
```

---

### **7.3 Plano de Gestão de Configuração**

```markdown
# Plano de Gestão de Configuração (GCO)

## Branching
- main — produção  
- develop — integração  
- feature/* — novas funcionalidades  
- hotfix/* — correções urgentes  

## Versionamento
- Padrão SemVer: vMAJOR.MINOR.PATCH  

## Baselines
- Criar tag por release ou entrega  
- Registrar em /mpsbr/evidencias/baselines.md  

## Controle de Mudanças
- Toda alteração deve ter issue + PR  
- Mínimo de 1 revisor obrigatório  
```

---

### **7.4 Plano de Medição**

```markdown
# Plano de Medição (MED)

## Métricas Coletadas
- Defeitos por release  
- Sucesso da CI  
- Cobertura de testes (%)  
- Lead time de PR  
- Severidade de defeitos  

## Periodicidade
- Semanal  
- A cada release  

## Armazenamento
- /mpsbr/evidencias/medicao/  
```

---

## 8. Evidências Necessárias para Avaliação MPS.br

Cada entrega deve incluir:

* Checklist completo
* Ata de reunião
* Relatórios de testes executados
* Atualização das métricas
* Baseline (tag) registrada
* Prints ou logs da CI
* Registro de mudanças (issues + PRs)

---

## 9. Conclusão

Este documento consolida o diagnóstico do estado atual do projeto **Phinancie-Mobile** em relação ao MPS.br e apresenta os passos necessários para alcançar conformidade com o **Nível G**.
Com os novos artefatos, estrutura de evidências, políticas de configuração e implantação de métricas, o projeto estará preparado para auditorias internas e futuras avaliações formais.


