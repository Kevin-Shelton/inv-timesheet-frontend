import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabaseApi as api } from '../../utils/supabase'
import { UserTable } from './UserTable'
import { UserModal } from './UserModal'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Plus, Search, Filter } from 'lucide-react'

export function TeamPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const userData = await api.getUsers()
      setUsers(userData)
    } catch (error) {
      console.error('Error loading users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUser = async (userData) => {
    try {
      await api.createUser(userData)
      await loadUsers()
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  const handleUpdateUser = async (userData) => {
    try {
      await api.updateUser(editingUser.id, userData)
      await loadUsers()
      setShowEditModal(false)
      setEditingUser(null)
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setShowEditModal(true)
  }

  const handleDeactivateUser = async (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      try {
        await api.deactivateUser(userId)
        await loadUsers()
      } catch (error) {
        console.error('Error deactivating user:', error)
      }
    }
  }

  const handleActivateUser = async (userId) => {
    try {
      await api.activateUser(userId)
      await loadUsers()
    } catch (error) {
      console.error('Error activating user:', error)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role === filterRole
    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className="team-loading">
        <div className="loading-spinner"></div>
        <p>Loading team members...</p>
      </div>
    )
  }

  return (
    <div className="team-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-left">
          <h1 className="page-title">Team Members</h1>
          <p className="page-subtitle">Manage your team members and their roles</p>
        </div>
        <div className="header-right">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="add-user-btn"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="team-controls">
        <div className="controls-left">
          <div className="search-container">
            <Search className="search-icon" />
            <Input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
        
        <div className="controls-right">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="role-filter"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="team_member">Team Member</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Team Stats */}
      <div className="team-stats">
        <div className="stat-card">
          <div className="stat-number">{users.length}</div>
          <div className="stat-label">Total Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{users.filter(u => u.is_active).length}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{users.filter(u => u.role === 'admin').length}</div>
          <div className="stat-label">Admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{users.filter(u => u.role === 'manager').length}</div>
          <div className="stat-label">Managers</div>
        </div>
      </div>

      {/* User Table */}
      <UserTable
        users={filteredUsers}
        onEdit={handleEditUser}
        onDeactivate={handleDeactivateUser}
        onActivate={handleActivateUser}
      />

      {/* Create User Modal */}
      {showCreateModal && (
        <UserModal
          mode="create"
          onSubmit={handleCreateUser}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit User Modal */}
      {showEditModal && editingUser && (
        <UserModal
          mode="edit"
          user={editingUser}
          onSubmit={handleUpdateUser}
          onClose={() => {
            setShowEditModal(false)
            setEditingUser(null)
          }}
        />
      )}
    </div>
  )
}

