# Components

A pasta `components` contém os componentes React reutilizáveis que formam a interface do Mangá Drops.

Esses componentes são responsáveis por exibir os produtos, séries e seções do site, além de controlar interações da interface.

O objetivo é **dividir a interface em blocos reutilizáveis**, facilitando manutenção, evolução do design e organização do código.

---

# Estrutura

Cada componente normalmente possui:

- arquivo `.jsx` responsável pela lógica e renderização
- estilos associados no sistema de estilos do projeto
- props para receber dados do frontend

Exemplo de organização:

```
components
│
├── ProductCard
├── SeriesCard
├── Rail
├── Modal
├── Header
└── Footer
```

---

# Fluxo de renderização

Os dados de produtos são carregados pelo frontend e renderizados através dos componentes.

Fluxo simplificado:

```
data/products
      ↓
App.jsx
      ↓
Rails
      ↓
ProductCard / SeriesCard
      ↓
Modal
```

---

# ProductCard

Componente responsável por exibir **um volume individual de mangá**.

Ele é o principal elemento visual do site.

### Informações exibidas

- capa do volume
- título
- preço
- desconto
- loja com melhor preço
- badges (ex: desconto ou novo)

### Comportamentos

- abrir modal ao clicar
- exibir botão de compra
- exibir preço ou botão "consultar valor" quando necessário

Esse componente é utilizado principalmente dentro dos **Rails**.

---

# SeriesCard

Representa **uma coleção de mangás**.

Exemplos de séries exibidas:

- Attack on Titan
- Jujutsu Kaisen
- One Piece

### Informações exibidas

- capa da coleção
- nome da série
- quantidade de volumes
- metadados da série

### Comportamento

Ao clicar, o usuário navega para a página da série com todos os volumes disponíveis.

---

# Rail

Rails são seções horizontais inspiradas em plataformas de streaming.

Eles organizam produtos em grupos temáticos.

Exemplos de rails do site:

- lançamentos
- melhores descontos
- coleções
- séries populares

Cada rail contém:

- título
- subtítulo
- lista horizontal de cards

Os rails utilizam **ProductCard ou SeriesCard** para renderizar o conteúdo.

---

# Modal

O modal exibe **informações detalhadas sobre um produto**.

Ele é aberto ao clicar em um `ProductCard`.

### Informações exibidas

- capa ampliada
- título completo
- descrição do volume
- preços disponíveis
- botões de compra

### Objetivo

Permitir que o usuário visualize mais detalhes antes de ir para a loja afiliada.

---

# Header

Componente responsável pelo topo do site.

### Funções

- navegação principal
- acesso às seções do site
- comportamento responsivo para mobile

O header pode mudar de layout dependendo da rolagem da página.

---

# Footer

Componente responsável pelo rodapé do site.

Normalmente contém:

- identidade do projeto
- links auxiliares
- informações adicionais

---

# Boas práticas

Para manter os componentes organizados:

- cada componente deve ter responsabilidade clara
- evitar lógica complexa diretamente no JSX
- preferir reutilização de componentes sempre que possível
- manter consistência visual entre os cards

---

# Integração com dados

Os componentes recebem dados provenientes da pasta:

```
src/data
```

Esses dados incluem:

- produtos
- séries
- preços
- descrições

Os componentes **não devem conter lógica de scraping ou manipulação de dados complexa**, apenas exibição e interação de interface.

---

# Resumo da arquitetura

```
src/data
      ↓
App.jsx
      ↓
Rails
      ↓
ProductCard / SeriesCard
      ↓
Modal
```

Essa arquitetura permite que o frontend seja **modular, escalável e fácil de manter**.