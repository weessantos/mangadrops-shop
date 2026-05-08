import { useParams } from "react-router-dom"

function ProductPage({ products }) {
  const { slug } = useParams()

  const product = products.find(p => p.slug === slug)

  if (!product) {
    return <p>Produto não encontrado</p>
  }

  return (
    <div className="productPage">
      <h1>{product.name}</h1>

      <img src={product.image} alt={product.name} />

      <p>{product.description}</p>

      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className="buyBtn"
      >
        Comprar
      </a>
    </div>
  )
}

export default ProductPage