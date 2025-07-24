import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Edit, Trash2, MoreHorizontal } from 'lucide-react'

export function CampaignTable({ campaigns, onEdit, onDelete }) {
  const formatCurrency = (amount) => {
    if (!amount) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (isActive) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    )
  }

  return (
    <div className="campaign-table-container">
      <table className="campaign-table">
        <thead>
          <tr>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Campaign Name</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Hourly Rate</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Start Date</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">End Date</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign) => (
            <tr key={campaign.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-3 px-4">
                <div className="font-medium text-gray-900">{campaign.name}</div>
              </td>
              <td className="py-3 px-4">
                <div className="text-gray-600 max-w-xs truncate">
                  {campaign.description || '-'}
                </div>
              </td>
              <td className="py-3 px-4 text-gray-900">
                {formatCurrency(campaign.hourly_rate)}
              </td>
              <td className="py-3 px-4 text-gray-900">
                {formatDate(campaign.start_date)}
              </td>
              <td className="py-3 px-4 text-gray-900">
                {formatDate(campaign.end_date)}
              </td>
              <td className="py-3 px-4">
                {getStatusBadge(campaign.is_active)}
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(campaign)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(campaign.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {campaigns.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-content">
            <h3 className="empty-state-title">No campaigns found</h3>
            <p className="empty-state-description">
              Get started by creating your first campaign.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

