import React from 'react';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-3xl p-8 border border-zinc-800 shadow-2xl">
        <h1 className="text-3xl font-black text-white italic mb-2 uppercase">M.M <span className="text-orange-500">SPORTS</span></h1>
        <p className="text-zinc-500 text-sm mb-8 uppercase tracking-widest font-bold">Admin Portal Login</p>
        <div className="space-y-4">
          <input type="email" placeholder="Admin Email" className="w-full bg-zinc-800 border-none rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-orange-500" />
          <input type="password" placeholder="Security Password" className="w-full bg-zinc-800 border-none rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-orange-500" />
          <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-orange-500/20 uppercase tracking-widest">Access System</button>
        </div>
      </div>
    </div>
  );
};

export default Login;