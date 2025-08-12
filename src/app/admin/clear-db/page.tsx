'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { validateAdminPassword } from '@/lib/admin-config';

export default function ClearDatabasePage() {
  const { data: session } = useSession();
  const [adminPassword, setAdminPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAdminAuth = () => {
    if (validateAdminPassword(adminPassword)) {
      setShowPasswordForm(false);
      setError('');
    } else {
      setError('Mot de passe administrateur incorrect');
    }
  };

  const handleClearDatabase = async () => {
    if (!confirm('⚠️ ATTENTION : Cette action va SUPPRIMER TOUTES les données de la base de données. Êtes-vous ABSOLUMENT sûr ?')) {
      return;
    }

    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/clear-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
      });

      if (response.ok) {
        setMessage('✅ Base de données vidée avec succès !');
        setShowPasswordForm(true);
        setAdminPassword('');
      } else {
        const errorData = await response.json();
        setError(`❌ Erreur : ${errorData.error || 'Erreur inconnue'}`);
      }
    } catch (err) {
      setError('❌ Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-red-600 mb-6">
            🗑️ Nettoyage de la Base de Données
          </h1>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              ⚠️ ATTENTION - ZONE DANGEREUSE
            </h2>
            <p className="text-red-700 text-sm">
              Cette page permet de vider complètement la base de données de l&apos;application.
              <br />
              <strong>Cette action est IRREVERSIBLE et supprimera TOUTES les données.</strong>
            </p>
          </div>

          {showPasswordForm ? (
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
              >
                🔐 Authentifier
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  ✅ Authentification réussie
                </h3>
                <p className="text-yellow-700 text-sm">
                  Vous êtes maintenant authentifié en tant qu&apos;administrateur.
                </p>
              </div>
              
              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  🚨 Action Dangereuse
                </h3>
                <p className="text-red-700 text-sm mb-4">
                  En cliquant sur le bouton ci-dessous, vous allez :
                </p>
                <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
                  <li>Supprimer TOUS les utilisateurs</li>
                  <li>Supprimer TOUS les projets</li>
                  <li>Supprimer TOUTES les tâches</li>
                  <li>Supprimer TOUS les messages</li>
                  <li>Supprimer TOUTES les conversations</li>
                  <li>Supprimer TOUTES les notifications</li>
                </ul>
              </div>
              
              <button
                onClick={handleClearDatabase}
                disabled={isLoading}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors font-semibold text-lg"
              >
                {isLoading ? '⏳ Suppression en cours...' : '🗑️ VIDER LA BASE DE DONNÉES'}
              </button>
              
              <button
                onClick={() => {
                  setShowPasswordForm(true);
                  setAdminPassword('');
                  setError('');
                  setMessage('');
                }}
                className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
              >
                🔒 Se déconnecter
              </button>
            </div>
          )}
          
          {message && (
            <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {message}
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href="/admin"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← Retour au tableau de bord administrateur
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
