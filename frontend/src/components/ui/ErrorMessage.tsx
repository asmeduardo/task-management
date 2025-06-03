interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="card-modern border-l-4 border-l-red-500 p-6 animate-slide-up">
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-white text-lg">⚠️</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-800 mb-1">
            Ops! Algo deu errado
          </h3>
          <p className="text-red-600">
            {message}
          </p>
          <p className="text-sm text-red-500 mt-2">
            Tente novamente em alguns segundos ou recarregue a página.
          </p>
        </div>
      </div>
    </div>
  );
}