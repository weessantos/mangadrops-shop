# Utils

A pasta `utils` contém funções utilitárias utilizadas em diferentes partes do projeto.

Essas funções são responsáveis por pequenas transformações de dados ou operações comuns que não pertencem diretamente aos componentes ou hooks.

O objetivo é **evitar repetição de código e centralizar lógica auxiliar**.

---

# Objetivo

Centralizar funções reutilizáveis que podem ser utilizadas por:

- componentes
- hooks
- páginas
- scripts do frontend

---

# Exemplos de utilitários

Alguns tipos comuns de utilitários utilizados no projeto incluem:

### Formatação de preço

Converter valores numéricos em formato monetário exibido no site.

Exemplo:

```
formatPrice(29.9)
```

Resultado:

```
R$ 29,90
```

---

### Cálculo de desconto

Funções que calculam o percentual de desconto entre preço original e preço atual.

Exemplo:

```
calculateDiscount(listPrice, currentPrice)
```

---

### Normalização de texto

Utilizado para padronizar strings em filtros e comparações.

Exemplo:

```
normalizeText("Jujutsu Kaisen")
```

Resultado:

```
jujutsu kaisen
```

---

### Manipulação de dados

Funções auxiliares para transformar listas de produtos ou séries.

Exemplo:

- ordenar produtos
- agrupar séries
- filtrar resultados

---

# Fluxo de uso

```
utils
      ↓
hooks
      ↓
components
```

As funções utilitárias geralmente são utilizadas dentro de hooks ou diretamente em componentes.

---

# Boas práticas

Para manter a pasta organizada:

- manter funções pequenas e específicas
- evitar dependência de estado React
- manter funções puras sempre que possível
- utilizar nomes claros e descritivos

---

# Quando usar utils

Uma função deve ir para `utils` quando:

- não depende de React
- pode ser reutilizada em várias partes do projeto
- representa uma operação simples e genérica