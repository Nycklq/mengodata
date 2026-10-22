# Decisões vigentes — 22/10/2026

## Atualização MengoData e redesign

Identidade pública passa a MengoData por solicitação explícita. Nomes de pacotes, diretórios, serviços internos e migrações permanecem para compatibilidade. A instrução mais recente autoriza commits locais por funcionalidade, sem push/publicação. O trabalho anterior sem commit foi registrado antes do redesign; o histórico Git preserva as etapas.

O Prompt Mestre e as referências corretas foram recuperados do ZIP original após identificar arquivos de nomes/extensões trocados. Os originais foram preservados. Logo fornecida usada byte a byte; fotos/marca Finexa não entram no bundle. Estádio próprio em SVG evita dependência de fotografia sem licença. Poppins é auto-hospedada com OFL preservada.

Landing pública `/` e painel `/dashboard`; aliases antigos preservam filtros e âncora. Sem login/cadastro/planos. Design system comum com temas persistentes. O bug visitante veio do domínio automático com mínimo 32; corrigido incluindo zero, comprovado por geometria Recharts e SQL/API reais. Nenhuma alteração de métricas ou banco foi necessária.

Em nova verificação READ ONLY, `mengo_data` manteve 380 jogos e snapshot igual à Gold; reimportação `changed=false`. A sessão backend 10840 foi localizada nesse banco. A automação Chrome foi interrompida por não confirmar a URL; não houve contorno ou aprovação visual. Power BI nativo continua pendente. As seções seguintes registram decisões anteriores, substituídas onde conflitarem com esta atualização.

Atualização posterior de PostgreSQL: a solicitação explícita do usuário define `mengo_data` em 127.0.0.1:5432 como destino ativo, substituindo a alternativa em `.local/postgres`. `.env` trocado com backup. O usuário habilitou LOGIN e aplicou grants mínimos no pgAdmin; o agente confirmou o schema existente, importou 380 partidas, reimportou sem mudanças e comprovou SQL/API no banco correto. Sem migração, recriação ou alteração de outro banco. Diagnóstico completo em POSTGRESQL_MENGO_DATA.md. O cluster anterior permanece preservado; referências abaixo à sua configuração descrevem a etapa anterior.

Refinamento sobre a base existente: logo original enviada, CSS adicional e componentes coletivos compartilhados, sem redesenho do modelo de dados. Comparação concentra sentido das métricas, diferenças e lacunas no domínio; jogos/empates não recebem vencedor, base zero fica indisponível e saldo relativo divide pelo módulo da base. Posição do resumo usa os 20 clubes do mesmo recorte.

A persistência permanente foi atendida criando cluster novo exclusivo do projeto, sem acessar bancos existentes. Estado em `.local/postgres`, senha aleatória no `.env` ignorado, SCRAM e loopback. Setup, start/stop/status, migração e importação explícitos. Testes de ciclo de vida usam outro cluster temporário. Nenhum serviço do Windows instalado.

Em 22/10/2026, inventário de UI vazio e navegador integrado indisponível. Revisão visual permanece manual com checklist. Power BI segue sem compilação/PBIX validado. As observações abaixo sobre banco pendente descrevem o estado anterior, superado pelo cluster próprio.

Análise coletiva Flamengo versus 19 clubes/2025/rodadas 1–38 substitui o foco individual. Shell React, estilos, SVGs, gateways, Express, pool, migrador e infraestrutura Python foram aproveitados.

Tabelas legadas restringem partidas ao Flamengo e não comportam 380 jogos. Migração coletiva cria schema/ledger próprios, preservando migrações e registros antigos. Testes históricos continuam úteis e isolados.

OpenFootball CC0 é fonte principal para placares coletivos, aprovada explicitamente em collective-source.json. O registro auxiliar anterior continua restrito ao fluxo individual. Conciliação de 380 placares CBF sem divergências; lacunas PDF de rodada/data explícitas.

Ranking calculado por quatro critérios e empates compartilhados, sem cartões inventados. Acumulados por rodada e sequências por data têm semânticas documentadas. Pandas/NumPy e PostgreSQL atendem volume pequeno; Parquet analítico, CSV BI e JSON API são interoperabilidade, sem alegar escala massiva.

Power BI nativo não validado; nenhum PBIX fictício. Inventário não mostrou Desktop. Revisão Chrome bloqueada pelo controle de URL, sem contorno. Configuração de banco dedicado permanece pendente; testes reais foram isolados. Sem commits/push/publicação.
