'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { validateAdminPassword } from '@/lib/admin-config';

export default function AdminPage() {
  const { data: session } = useSession();
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(true);
  const [error, setError] = useState('');

  const handleAdminAuth = () => {
    if (validateAdminPassword(adminPassword)) {
      setShowPasswordForm(false);
      setError('');
    } else {
      setError('Mot de passe administrateur incorrect');
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">🔒 Accès Restreint</h1>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour accéder à cette page.
          </p>
          <a
            href="/auth/signin"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors block text-center"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            🛠️ Tableau de Bord Administrateur
          </h1>
          
          {showPasswordForm ? (
            <div className="max-w-md mx-auto">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                  ⚠️ Zone Restreinte
                </h2>
                <p className="text-yellow-700 text-sm">
                  Cette page permet d&apos;accéder aux fonctions d&apos;administration sensibles.
                  <br />
                  <strong>Accès réservé aux administrateurs uniquement.</strong>
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe administrateur
                  </label>
                  <input
                    type="password"
                    id="adminPassword"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Entrez le mot de passe administrateur"
                  />
                </div>
                
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                
                <button
                  onClick={handleAdminAuth}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  🔐 Authentifier
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ✅ Authentification réussie
                </h3>
                <p className="text-green-700 text-sm">
                  Vous êtes maintenant authentifié en tant qu&apos;administrateur.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Nettoyage de la Base de Données */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">🗑️</span>
                    <h3 className="text-lg font-semibold text-red-800">
                      Nettoyage de la Base de Données
                    </h3>
                  </div>
                  <p className="text-red-700 text-sm mb-4">
                    Supprimer toutes les données de l&apos;application (utilisateurs, projets, tâches, etc.)
                  </p>
                  <a
                    href="/admin/clear-db"
                    className="inline-block bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Accéder →
                  </a>
                </div>
                
                {/* Statistiques */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">📊</span>
                    <h3 className="text-lg font-semibold text-blue-800">
                      Statistiques
                    </h3>
                  </div>
                  <p className="text-blue-700 text-sm mb-4">
                    Consulter les statistiques d&apos;utilisation et les métriques de l&apos;application
                  </p>
                  <button
                    disabled
                    className="inline-block bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed text-sm font-medium"
                  >
                    Bientôt disponible
                  </button>
                </div>
                
                {/* Gestion des Utilisateurs */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">👥</span>
                    <h3 className="text-lg font-semibold text-green-800">
                      Gestion des Utilisateurs
                    </h3>
                  </div>
                  <p className="text-green-700 text-sm mb-4">
                    Gérer les comptes utilisateurs, les rôles et les permissions
                  </p>
                  <button
                    disabled
                    className="inline-block bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed text-sm font-medium"
                  >
                    Bientôt disponible
                  </button>
                </div>
                
                {/* Logs Système */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">📝</span>
                    <h3 className="text-lg font-semibold text-purple-800">
                      Logs Système
                    </h3>
                  </div>
                  <p className="text-purple-700 text-sm mb-4">
                    Consulter les logs d&apos;activité et les erreurs système
                  </p>
                  <button
                    disabled
                    className="inline-block bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed text-sm font-medium"
                  >
                    Bientôt disponible
                  </button>
                </div>
                
                {/* Sauvegarde */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">💾</span>
                    <h3 className="text-lg font-semibold text-orange-800">
                      Sauvegarde
                    </h3>
                  </div>
                  <p className="text-orange-700 text-sm mb-4">
                    Créer et restaurer des sauvegardes de la base de données
                  </p>
                  <button
                    disabled
                    className="inline-block bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed text-sm font-medium"
                  >
                    Bientôt disponible
                  </button>
                </div>
                
                {/* Configuration */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <span className="text-2xl mr-3">⚙️</span>
                    <h3 className="text-lg font-semibold text-indigo-800">
                      Configuration
                    </h3>
                  </div>
                  <p className="text-indigo-700 text-sm mb-4">
                    Modifier les paramètres globaux de l&apos;application
                  </p>
                  <button
                    disabled
                    className="inline-block bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed text-sm font-medium"
                  >
                    Bientôt disponible
                  </button>
                </div>
              </div>
              
              <div className="flex justify-center pt-6">
                <button
                  onClick={() => {
                    setShowPasswordForm(true);
                    setAdminPassword('');
                    setError('');
                  }}
                  className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600 transition-colors"
                >
                  🔒 Se déconnecter
                </button>
              </div>
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Retour à l&apos;accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
