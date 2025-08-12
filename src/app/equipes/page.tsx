"use client";
import { useEffect, useState } from "react";
import { useNotifications } from "@/context/NotificationsContext";
import UserAvatar from "@/components/UserAvatar";
import Tooltip from "@/components/Tooltip";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
interface Chat {
  id: string;
  name: string;
  members: User[];
  team?: {
    id: string;
    ownerId: string;
  };
}
interface Message {
  id: string;
  content: string;
  createdAt: string;
  author: { id: string; name: string; avatar?: string };
}
type MessageWithTmp = Message & { tmp?: boolean };

export default function ChatsPage() {
  const { addNotification, upsertNotification } = useNotifications();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<MessageWithTmp[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userQuery, setUserQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [notif, setNotif] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Charger l'utilisateur courant
  useEffect(() => {
    fetch("/api/user/profile")
      .then((r) => r.json())
      .then((u) => setCurrentUser(u))
      .catch(() => {});
  }, []);

  // Charger les chats de l'utilisateur
  useEffect(() => {
    fetch("/api/conversations")
      .then((r) => r.json())
      .then((data) => {
        setChats(data);
        if (data.length > 0 && !selectedChat) setSelectedChat(data[0]);
      })
      .catch(() => {});
  }, []);

  // Charger les messages du chat sélectionné
  useEffect(() => {
    if (!selectedChat) return;
    fetch(`/api/chats/${selectedChat.id}/messages`)
      .then((r) => r.json())
      .then(setMessages)
      .catch(() => {});
  }, [selectedChat]);

  // Charger tous les utilisateurs pour la création de chat
  useEffect(() => {
    if (!showModal) return;
    fetch("/api/users")
      .then((r) => r.json())
      .then(setAllUsers)
      .catch(() => {});
  }, [showModal]);

  // Créer un nouveau chat
  const handleCreateChat = async () => {
    if (selectedUserIds.length === 0) return;
    const name = prompt("Nom du chat ?", "Nouveau chat") || "Nouveau chat";
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, memberIds: selectedUserIds }),
    });
    if (res.ok) {
      setNotif("Chat créé !");
      setShowModal(false);
      setSelectedUserIds([]);
      setUserQuery("");
      // Recharge la liste des chats et sélectionne le nouveau
      const created = await res.json(); // { teamId, chatId }
      fetch("/api/conversations")
        .then((r) => r.json())
        .then((all: Chat[]) => {
          setChats(all);
          const newChat = all.find((c) => c.id === created.chatId) || null;
          if (newChat) setSelectedChat(newChat);
          addNotification({ title: 'Nouveau chat', message: `Chat "${name}" créé avec ${selectedUserIds.length} membre(s)` })
        });
    } else {
      const data = await res.json().catch(() => ({} as any));
      setNotif(data?.error ? `Erreur: ${data.error}` : `Erreur lors de la création du chat (${res.status})`);
    }
  };

  // Envoyer un message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    const optimistic: MessageWithTmp = {
      id: `tmp-${Date.now()}`,
      content: newMessage.trim(),
      createdAt: new Date().toISOString(),
      author: { id: currentUser?.id || 'me', name: currentUser?.name || 'Moi', avatar: currentUser?.avatar },
      tmp: true
    };
    setMessages(prev => [...prev, optimistic]);
    const toSend = newMessage.trim();
    setNewMessage("");

    const res = await fetch(`/api/chats/${selectedChat.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: toSend }),
    });
    if (res.ok) {
      const saved: Message = await res.json();
      setMessages(prev => prev.map(m => m.id.startsWith('tmp-') && m.content === toSend ? saved : m));
      upsertNotification(`chat:${selectedChat.id}`, { title: 'Nouveaux messages', message: `Activité récente dans ${selectedChat.name}` })
      // Auto-scroll to bottom after message arrives
      requestAnimationFrame(() => {
        const container = document.querySelector('[data-messages-container="1"]') as HTMLDivElement | null
        if (container) container.scrollTop = container.scrollHeight
      })
    } else {
      // rollback
      setMessages(prev => prev.filter(m => !(m.id.startsWith('tmp-') && m.content === toSend)));
    }
  };

  // Filtrer les utilisateurs pour la recherche
  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userQuery.toLowerCase())
  );

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr 260px", gap: 20, padding: 24, color: "var(--text-color)", background: "var(--bg-color)", minHeight: "100vh" }}>
      {/* Liste des chats */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: 18, color: "var(--text-color)" }}>Chats</h3>
          <Tooltip content="Créer un nouveau chat" position="bottom">
            <button onClick={() => setShowModal(true)} style={{ border: "1px solid var(--border-color)", borderRadius: 8, padding: "6px 10px", cursor: "pointer", color: "var(--text-color)", background: "var(--bg-color)" }}>+ Nouveau</button>
          </Tooltip>
        </div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
          {chats.length === 0 ? (
            <div style={{ opacity: .7, fontSize: 14, color: "var(--text-color)" }}>Aucun chat</div>
          ) : chats.map((c) => (
            <button key={c.id} onClick={() => setSelectedChat(c)} style={{ textAlign: "left", padding: 8, borderRadius: 8, border: c.id === selectedChat?.id ? "2px solid #3b82f6" : "1px solid var(--border-color)", background: "var(--bg-color)", marginBottom: 4, cursor: "pointer", color: "var(--text-color)" }}>
              <div style={{ fontWeight: 600 }}>{c.name}</div>
              <div style={{ opacity: .7, fontSize: 12, color: "var(--text-color)" }}>{c.members.length} membres</div>
              </button>
          ))}
        </div>
      </div>

      {/* Messages du chat */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <h3 style={{ margin: 0, fontSize: 18, color: "var(--text-color)" }}>{selectedChat ? selectedChat.name : "Sélectionne un chat"}</h3>
        {selectedChat ? (
          <>
            <div data-messages-container="1" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8, background: "var(--bg-color)", border: "1px solid var(--border-color)", borderRadius: 8, padding: 8, marginTop: 12 }}>
              {messages.length === 0 ? (
                <div style={{ opacity: .7, fontSize: 14, color: "var(--text-color)" }}>Aucun message</div>
              ) : messages.map((m) => (
                <div key={m.id} style={{ 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 8, 
                  padding: 12, 
                  opacity: m.tmp ? .6 : 1, 
                  color: "var(--text-color)",
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start'
                }}>
                  {/* Avatar de l'utilisateur */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: m.author.avatar 
                      ? `url(${m.author.avatar}) center/cover`
                      : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                    flexShrink: 0
                  }}>
                    {m.author.avatar ? '' : m.author.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Contenu du message */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      marginBottom: 6 
                    }}>
                      <div style={{ 
                        fontWeight: '600', 
                        color: "var(--text-color)",
                        fontSize: '14px'
                      }}>
                        {m.author.name}
                      </div>
                      <div style={{ 
                        fontSize: '12px', 
                        opacity: .7, 
                        color: "var(--text-color)" 
                      }}>
                        {new Date(m.createdAt).toLocaleString('fr-FR')}
                      </div>
                    </div>
                    
                    <div style={{ 
                      color: "var(--text-color)", 
                      lineHeight: '1.5',
                      marginBottom: 8
                    }}>
                      {m.content}
                    </div>
                    
                    {/* Bouton supprimer (pour l'auteur du message) */}
                    {currentUser?.id === m.author.id && !m.tmp && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                        <Tooltip content="Supprimer ce message" position="top">
                          <button onClick={async () => {
                            if (!selectedChat) return
                            const ok = confirm('Supprimer ce message ?')
                            if (!ok) return
                            const res = await fetch(`/api/chats/${selectedChat.id}/messages?messageId=${m.id}`, { method: 'DELETE' })
                            if (res.ok) {
                              setMessages(prev => prev.filter(x => x.id !== m.id))
                            }
                          }} style={{ 
                            border: '1px solid var(--border-color)', 
                            borderRadius: 6, 
                            padding: '4px 8px', 
                            color: '#ef4444', 
                            background: 'transparent', 
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}>
                            Supprimer
                          </button>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} placeholder="Ton message..." style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
              <Tooltip content="Envoyer le message (ou appuie sur Entrée)" position="top">
                <button onClick={handleSendMessage} style={{ padding: '8px 12px', borderRadius: 8, background: '#3b82f6', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Envoyer</button>
              </Tooltip>
            </div>
          </>
        ) : <p style={{ opacity: .7, color: "var(--text-color)" }}>Sélectionne un chat</p>}
      </div>

      {/* Membres du chat */}
      <div style={{ background: "var(--card-bg)", border: "1px solid var(--border-color)", borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: "var(--text-color)" }}>Membres</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {selectedChat && (
              <>
                <Tooltip content="Ajouter un membre" position="bottom">
                  <button
                    onClick={() => {
                      // Charger tous les utilisateurs et afficher une liste
                      fetch('/api/users')
                        .then(r => r.json())
                        .then((allUsers: User[]) => {
                          const availableUsers = allUsers.filter(u => 
                            !selectedChat.members.some(m => m.id === u.id)
                          )
                          
                          if (availableUsers.length === 0) {
                            alert('Tous les utilisateurs sont déjà membres de ce chat')
                            return
                          }
                          
                          const userList = availableUsers.map(u => `${u.name} (${u.email})`).join('\n')
                          const index = prompt(`Utilisateurs disponibles (0-${availableUsers.length - 1}):\n${userList}\n\nEntrez l'index de l'utilisateur à ajouter:`)
                          
                          if (index !== null && !isNaN(Number(index))) {
                            const userIndex = parseInt(index)
                            if (userIndex >= 0 && userIndex < availableUsers.length) {
                              const selectedUser = availableUsers[userIndex]
                              
                              fetch(`/api/chats/${selectedChat.id}/members`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: selectedUser.id })
                              }).then(() => {
                                // Recharger les chats
                                fetch("/api/conversations")
                                  .then((r) => r.json())
                                  .then((data) => {
                                    setChats(data)
                                    const updatedChat = data.find((c: Chat) => c.id === selectedChat.id)
                                    if (updatedChat) setSelectedChat(updatedChat)
                                  })
                              })
                            }
                          }
                        })
                    }}
                    style={{
                      padding: '6px 10px',
                      border: '1px solid var(--border-color)',
                      borderRadius: 6,
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: 12,
                      color: 'var(--text-color)'
                    }}
                  >
                    + Ajouter
                  </button>
                </Tooltip>
                
                {/* Bouton de suppression du chat (seulement pour le propriétaire) */}
                {currentUser && selectedChat.team && selectedChat.team.ownerId === currentUser.id && (
                  <Tooltip content="Supprimer ce chat" position="bottom">
          <button
                      onClick={async () => {
                        if (confirm(`Êtes-vous sûr de vouloir supprimer le chat "${selectedChat.name}" ? Cette action est irréversible.`)) {
                          try {
                            const response = await fetch(`/api/chats/${selectedChat.id}`, {
                              method: 'DELETE'
                            })
                            if (response.ok) {
                              // Recharger les chats
                              fetch("/api/conversations")
                                .then((r) => r.json())
                                .then((data) => {
                                  setChats(data)
                                  if (data.length > 0) {
                                    setSelectedChat(data[0])
                                  } else {
                                    setSelectedChat(null)
                                  }
                                })
                            }
                          } catch (error) {
                            console.error('Error deleting chat:', error)
                          }
                        }
                      }}
                      style={{
                        padding: '6px 10px',
                        border: '1px solid #ef4444',
                        borderRadius: 6,
                        background: 'transparent',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: 12,
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      🗑️ Supprimer
          </button>
                  </Tooltip>
                )}
              </>
            )}
          </div>
        </div>
        {selectedChat ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
            {selectedChat.members.map((m) => (
              <div key={m.id} style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 8,
                border: '1px solid var(--border-color)', 
                borderRadius: 8, 
                padding: 8,
                position: 'relative'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 auto', minWidth: 0 }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: m.avatar 
                      ? `url(${m.avatar}) center/cover`
                      : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px',
                    border: '2px solid rgba(255, 255, 255, 0.2)'
                  }}>
                    {m.avatar ? '' : m.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-color)' }}>{m.name}</div>
                    <div style={{ opacity: .7, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-color)' }}>{m.email}</div>
                  </div>
                </div>
                {/* Bouton de suppression des membres (réservé au créateur du chat) */}
                {currentUser && selectedChat.team && selectedChat.team.ownerId === currentUser.id && m.id !== currentUser.id && (
                  <button
                    onClick={async () => {
                      if (confirm(`Révoquer l'accès de ${m.name} ?`)) {
                        try {
                          const response = await fetch(`/api/chats/${selectedChat.id}/members?userId=${m.id}`, {
                            method: 'DELETE'
                          })
                          if (response.ok) {
                            fetch('/api/conversations')
                              .then((r) => r.json())
                              .then((data) => {
                                setChats(data)
                                const updatedChat = data.find((c: Chat) => c.id === selectedChat.id)
                                if (updatedChat) setSelectedChat(updatedChat)
                              })
                          } else {
                            console.error('Error response:', response.status, response.statusText)
                          }
                        } catch (error) {
                          console.error('Error removing member:', error)
                        }
                      }
                    }}
                    style={{
                      padding: '4px 8px',
                      border: 'none',
                      background: 'transparent',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      flexShrink: 0,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
                      e.currentTarget.style.borderRadius = '4px'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    Del
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : <div style={{ opacity: .7, fontSize: 14, color: "var(--text-color)" }}>Sélectionne un chat</div>}
      </div>

      {/* Modal de création de chat */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }} onClick={() => setShowModal(false)}>
          <div style={{ width: 420, maxWidth: '90%', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18, marginBottom: 12, color: "var(--text-color)" }}>Nouveau chat</h3>
            <input value={userQuery} onChange={e => setUserQuery(e.target.value)} placeholder="Rechercher des utilisateurs..." style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--input-bg)', color: 'var(--text-color)' }} />
            <div style={{ maxHeight: 260, overflowY: 'auto', marginTop: 8, border: '1px solid var(--border-color)', borderRadius: 8 }}>
              {filteredUsers.length === 0 ? (
                <div style={{ padding: 12, opacity: .7, fontSize: 14, color: "var(--text-color)" }}>Aucun résultat</div>
              ) : filteredUsers.map(u => (
                <label key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderBottom: '1px solid var(--border-color)', cursor: 'pointer', color: "var(--text-color)" }}>
                  <span style={{ color: "var(--text-color)" }}>{u.name} <span style={{ opacity: .6, fontSize: 12, color: "var(--text-color)" }}>({u.email})</span></span>
                  <input type="checkbox" checked={selectedUserIds.includes(u.id)} onChange={() => setSelectedUserIds(prev => prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id])} />
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <Tooltip content="Annuler la création" position="top">
                <button onClick={() => setShowModal(false)} style={{ border: '1px solid var(--border-color)', background: 'transparent', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: 'var(--text-color)' }}>Annuler</button>
              </Tooltip>
              <Tooltip content={selectedUserIds.length === 0 ? "Sélectionne au moins un utilisateur" : "Créer le chat avec les utilisateurs sélectionnés"} position="top">
                <button disabled={selectedUserIds.length === 0} onClick={handleCreateChat} style={{ background: '#3b82f6', color: 'white', border: 'none', borderRadius: 8, padding: '8px 12px', fontWeight: 600, cursor: selectedUserIds.length === 0 ? 'not-allowed' : 'pointer', opacity: selectedUserIds.length === 0 ? 0.6 : 1 }}>Créer</button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notif && (
        <div style={{ position: 'fixed', top: 24, right: 24, background: '#3b82f6', color: 'white', padding: '12px 24px', borderRadius: 8, zIndex: 100 }}>{notif}</div>
      )}
    </div>
  );
}
