import { useState } from 'react';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!fullName || !institution) {
          setError('Por favor, preencha todos os campos');
          return;
        }
        await signUp(email, password, fullName, institution);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="page-login" className="min-h-screen bg-gradient-to-br from-[#2703A6] via-[#201AD9] to-[#4945BF] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#2703A6] to-[#4945BF] rounded-2xl flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1
            id="logo-eduplanner"
            className="text-3xl font-bold bg-gradient-to-r from-[#2703A6] to-[#4945BF] bg-clip-text text-transparent"
          >
            EduPlanner
          </h1>
          <p className="text-gray-600 text-sm mt-2">Sistema de Coordenação Acadêmica</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2703A6]/30 focus:border-[#2703A6] transition-all"
                  placeholder="Digite seu nome"
                  required={!isLogin}
                />
              </div>

              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-2">
                  Instituição
                </label>
                <input
                  id="institution"
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2703A6]/30 focus:border-[#2703A6] transition-all"
                  placeholder="Nome da instituição"
                  required={!isLogin}
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="input-email" className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              id="input-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2703A6]/30 focus:border-[#2703A6] transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="input-password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              id="input-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2703A6]/30 focus:border-[#2703A6] transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-[#FF0000]/10 border border-[#FF0000]/30 text-[#FF0000] px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            id="btn-login"
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#2703A6] to-[#201AD9] text-white font-semibold py-3 rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Carregando...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            id="btn-register"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-[#2703A6] hover:text-[#201AD9] font-medium text-sm transition-colors"
          >
            {isLogin ? 'Cadastrar nova conta' : 'Já tenho conta'}
          </button>

          {isLogin && (
            <>
              <br />
              <button
                id="link-forgot-password"
                className="text-gray-600 hover:text-gray-800 text-sm transition-colors"
              >
                Esqueci minha senha
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
