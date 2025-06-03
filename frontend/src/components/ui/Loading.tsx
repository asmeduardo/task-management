export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center p-16 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-transparent"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 rounded-full animate-ping opacity-75 border-t-transparent"></div>
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Carregando...</h3>
        <p className="text-sm text-gray-500">Estamos buscando suas tarefas</p>
      </div>
    </div>
  );
}