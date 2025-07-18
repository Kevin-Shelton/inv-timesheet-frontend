import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Edit, MoreHorizontal, UserCheck, UserX } from 'lucide-react'

export function UserTable({ users, onEdit, onDeactivate, onActivate }) {
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getRoleBadgeVariant = (role) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'manager': return 'default'
      case 'team_member': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusBadgeVariant = (isActive) => {
    return isActive ? 'default' : 'outline'
  }

  return (
    <div className="user-table-container">
      <table className="user-table">
        <thead>
          <tr>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Role</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Pay Rate</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Hire Date</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="flex items-center">
                  <div className="user-avatar">
                    {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="ml-3">
                    <div className="font-medium text-gray-900">{user.full_name}</div>
                    {user.phone && (
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 text-gray-900">{user.email}</td>
              <td className="py-3 px-4">
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role?.replace('_', ' ').toUpperCase()}
                </Badge>
              </td>
              <td className="py-3 px-4 text-gray-900">
                {formatCurrency(user.pay_rate_per_hour)}/hr
              </td>
              <td className="py-3 px-4 text-gray-900">
                {formatDate(user.hire_date)}
              </td>
              <td className="py-3 px-4">
                <Badge variant={getStatusBadgeVariant(user.is_active)}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(user)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  {user.is_active ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeactivate(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onActivate(user.id)}
                      className="text-green-600 hover:text-green-700"
                    >
                      <UserCheck className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-content">
            <h3 className="empty-state-title">No team members found</h3>
            <p className="empty-state-description">
              Get started by adding your first team member.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

