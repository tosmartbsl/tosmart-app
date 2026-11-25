import type { Metadata } from 'next'
import UserManagementWorkspace from '@/components/dashboard/user-management-workspace'

export const metadata: Metadata = {
  title: 'Manajemen Pengguna | Tosmart',
  description: 'Kelola akun pengguna dan akses tim toko di Tosmart.',
}

export default function UsersPage() {
  return <UserManagementWorkspace />
}
