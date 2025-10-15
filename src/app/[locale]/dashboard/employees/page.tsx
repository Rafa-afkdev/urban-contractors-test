import React from 'react'
import EmployeesComponent from './components/employees'
import { RoleGuard } from '@/components/role-guard'

export default function EmployeesPage() {
  return (
    <RoleGuard allowedRoles={['ADMIN', 'SUPERVISOR', 'CONTADOR']}>
      <div>
        <EmployeesComponent/>
      </div>
    </RoleGuard>
  )
}
