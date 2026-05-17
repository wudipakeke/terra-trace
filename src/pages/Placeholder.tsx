import { useNavigate } from 'react-router-dom';

interface PlaceholderProps {
  title: string;
  icon: string;
  description: string;
}

export function Placeholder({ title, icon, description }: PlaceholderProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-8xl mb-4 opacity-50">{icon}</div>
        <h1 className="text-2xl font-bold text-gray-700">{title}</h1>
        <p className="text-gray-400">{description}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 cursor-pointer"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}
