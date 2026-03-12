# Hooks

A pasta `hooks` contém hooks personalizados do React utilizados no Mangá Drops.

Hooks são funções que permitem reutilizar lógica entre componentes, mantendo o código mais organizado e modular.

Eles ajudam a separar **lógica de comportamento** da **renderização da interface**.

---

# Objetivo

Centralizar comportamentos reutilizáveis utilizados por diferentes componentes do projeto.

Isso evita:

- duplicação de lógica
- componentes muito grandes
- mistura de lógica com interface

---

# Exemplos de responsabilidades

Os hooks podem controlar diferentes aspectos da aplicação, como:

- controle de filtros
- sincronização com parâmetros da URL
- abertura e fechamento de modais
- estados de navegação
- comportamento responsivo
- controle de scroll

---

# Como os hooks são utilizados

Os hooks são importados diretamente dentro de componentes React.

Exemplo:

```
import useFiltroProdutos from "../hooks/useFiltroProdutos"
```

Dentro do componente:

```
const produtosFiltrados = useFiltroProdutos(produtos)
```

O componente continua responsável pela interface, enquanto o hook cuida da lógica.

---

# Fluxo de uso

```
hooks
      ↓
components
      ↓
interface
```

Os hooks atuam como uma camada intermediária entre os dados e a interface.

---

# Boas práticas

Para manter os hooks organizados:

- cada hook deve ter uma responsabilidade clara
- evitar lógica visual dentro dos hooks
- manter nomes descritivos iniciando com `use`
- evitar dependências desnecessárias entre hooks

Exemplo de nome correto:

```
useFiltroProdutos
useModal
useQueryParams
```

---

# Benefícios

Utilizar hooks personalizados permite:

- código mais limpo
- melhor reutilização
- separação clara de responsabilidades
- manutenção mais simples