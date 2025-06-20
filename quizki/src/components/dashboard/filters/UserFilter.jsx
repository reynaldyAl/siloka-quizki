// src/components/dashboard/filters/UserFilter.js
import React, { useState } from 'react';

const UserFilter = ({ onFilterChange }) => {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [status, setStatus] = useState('all');

  const handleFilterChange = () => {
    onFilterChange({
      search: search.toLowerCase(),
      role: role !== 'all' ? role : null,
      status: status !== 'all' ? status : null
    });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setTimeout(() => {
      onFilterChange({
        search: e.target.value.toLowerCase(),
        role: role !== 'all' ? role : null,
        status: status !== 'all' ? status : null
      });
    }, 300);
  };

  const handleReset = () => {
    setSearch('');
    setRole('all');
    setStatus('all');
    onFilterChange({
      search: '',
      role: null,
      status: null
    });
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-grow">
          <label htmlFor="search" className="block text-sm font-medium text-gray-300 mb-1">
            Search Users
          </label>
          <div className="relative">
            <input
              id="search"
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Search by username or email..."
              className="w-full bg-gray-800 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">
            Role
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setTimeout(handleFilterChange, 100);
            }}
            className="bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setTimeout(handleFilterChange, 100);
            }}
            className="bg-gray-800 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="self-end">
          <button
            onClick={handleReset}
            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFilter;