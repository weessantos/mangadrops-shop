# Scripts

A pasta `scripts` contém os scripts de automação utilizados pelo Mangá Drops.

Esses scripts são responsáveis por tarefas que não fazem parte do frontend, como:

- atualização automática de preços
- autenticação no Mercado Livre
- gerenciamento de sessão para scraping
- publicação/deploy do projeto

Esses scripts são executados via **Node.js** e geralmente são acionados através de comandos do `npm`.

---

# Estrutura

```
scripts
│
├── loginMercadoLivre.js
├── ml-session.json
├── ml-session-base64.txt
├── publish.mjs
└── updatePrices.js
```

Cada arquivo possui uma responsabilidade específica dentro do sistema de automação.

---

# updatePrices.js

Este é o **script principal de scraping de preços** do projeto.

Ele busca os preços atualizados dos produtos nas lojas afiliadas e salva os resultados no arquivo:

```
src/data/prices.json
```

### Fluxo de execução

```
produtos
      ↓
links afiliados
      ↓
abrir páginas das lojas
      ↓
extrair preços
      ↓
salvar em prices.json
```

### Responsabilidades

- abrir páginas de produto
- identificar preços nas páginas
- tratar variações de layout
- aplicar concorrência para acelerar o processo
- registrar logs de debug
- gerar estatísticas de execução

### Execução

O script pode ser executado manualmente com:

```
npm run update-prices
```

---

# loginMercadoLivre.js

Script responsável por realizar login no Mercado Livre e gerar uma sessão válida para scraping.

Algumas páginas do Mercado Livre podem exigir autenticação ou apresentar bloqueios automatizados.  
Esse script permite manter uma sessão ativa para evitar esses problemas.

### Fluxo

```
login no Mercado Livre
      ↓
geração de sessão
      ↓
salvar sessão
```

A sessão gerada é armazenada no arquivo:

```
ml-session.json
```

---

# ml-session.json

Arquivo que armazena os cookies de sessão do Mercado Livre.

Ele é utilizado pelo scraper para acessar páginas de produto sem precisar fazer login a cada execução.

Esse arquivo é utilizado pelo:

```
updatePrices.js
```

---

# ml-session-base64.txt

Versão codificada da sessão do Mercado Livre.

Esse formato pode ser utilizado para:

- armazenamento seguro
- uso em automações
- integração com CI/CD

---

# publish.mjs

Script responsável por realizar o deploy do projeto.

Ele automatiza o processo de publicação da aplicação.

### Fluxo de deploy

```
build do projeto
      ↓
preparação dos arquivos
      ↓
publicação no GitHub Pages
```

### Execução

```
npm run publish
```

Esse processo geralmente executa:

1. build do frontend
2. preparação da pasta `dist`
3. publicação do site

---

# Fluxo completo do sistema

Atualização de preços:

```
affiliates.js
      ↓
updatePrices.js
      ↓
prices.json
      ↓
frontend React
```

Deploy do site:

```
build do projeto
      ↓
publish.mjs
      ↓
GitHub Pages
```

---

# Logs e debug

Durante a execução do `updatePrices.js`, o script exibe logs para facilitar a identificação de problemas.

Exemplo de log:

```
[ML DEBUG] jjk-12 -> source=main_center_price price=43.9
```

Esses logs ajudam a identificar:

- de onde o preço foi extraído
- se houve erro de scraping
- produtos sem preço encontrado

---

# Boas práticas

Para manter o sistema estável:

- manter a sessão do Mercado Livre atualizada quando necessário
- verificar logs de debug em caso de erro no scraping
- rodar o script de atualização de preços antes de publicar novas séries
- evitar modificar manualmente o `prices.json`

---

# Comandos importantes

Executar scraping de preços:

```
npm run update-prices
```

Publicar o site:

```
npm run publish
```

Esses comandos fazem parte do fluxo normal de manutenção do projeto.