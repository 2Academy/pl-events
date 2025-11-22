import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-gray-600 mb-6">Страница не найдена</p>
      <Link
        href="/"
        className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Вернуться на главную
      </Link>
    </div>
  )
}

