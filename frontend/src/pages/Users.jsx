import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Update from "../assets/update.png";
import { useDispatch, useSelector } from "react-redux";

function User() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [newBranch, setNewBranch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchUsers();
  }, [branchFilter]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("http://localhost:3000/users/get-all");
      const filteredUsers = branchFilter
        ? response.data.filter(
            (user) =>
              user.branch.toLowerCase() === branchFilter.toLowerCase()
          )
        : response.data;
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleUpdateUser = (userId) => {
    if (!isAdmin) {
      alert("Only admins can update users.");
      return;
    }
    const userToEdit = users.find((u) => u.user_id === userId);
    setEditingUser(userToEdit);
    setNewRole(userToEdit.role);
    setNewBranch(userToEdit.branch);
  };

  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    if (editingUser) {
      try {
        const response = await axios.put(
          `http://localhost:3000/users/update/${editingUser.user_id}`,
          { role: newRole, branch: newBranch }
        );
        console.log("User updated:", response.data);
        setEditingUser(null);
        fetchUsers();
      } catch (error) {
        console.error("Error updating user:", error);
      }
    }
  };

  const mapBranchName = (branch) => {
    const branchMapping = {
      Acalapati: "acalapati",
      Agregator: "agregator",
    };
    return branchMapping[branch] || branch.toLowerCase();
  };

  const handleFilterByBranch = (branch) => {
    const mappedBranch = mapBranchName(branch);
    setBranchFilter(mappedBranch);
  };

  const resetFilters = () => {
    setBranchFilter("");
    fetchUsers();
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-grow p-4 max-w-[95%] mx-auto text-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-700">Users</h1>
          <div className="flex space-x-2">
            <select
              value={branchFilter}
              onChange={(e) => handleFilterByBranch(e.target.value)}
              className="px-2 py-1 bg-gray-200 text-xs font-semibold rounded-md hover:bg-gray-300"
            >
              <option value="">Select Branch</option>
              <option value="Acalapati">Acalapati</option>
              <option value="Agregator">Agregator</option>
            </select>
            <button
              onClick={resetFilters}
              className="px-2 py-1 bg-gray-800 text-white text-xs font-semibold rounded-md hover:bg-gray-900"
            >
              Show All
            </button>
          </div>
        </div>

        {editingUser && (
          <div className="mt-6 p-4 border rounded-lg bg-white">
            <h2 className="text-xl font-bold mb-4">
              Edit {editingUser?.name || "User"}'s Data
            </h2>
            <form onSubmit={handleSubmitUpdate}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900">Role</label>
                <select
                  className="block w-full px-3 py-2 mt-2 border border-gray-300 rounded-md"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-900">Branch</label>
                <select
                  className="block w-full px-3 py-2 mt-2 border border-gray-300 rounded-md"
                  value={newBranch}
                  onChange={(e) => setNewBranch(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="acalapati">Acalapati</option>
                  <option value="agregator">Agregator</option>
                </select>
              </div>

              <div className="flex justify-end mt-4 space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-2 py-1 bg-gray-300 text-xs text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-2 py-1 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="overflow-x-auto mt-6">
          <table className="table-auto w-full bg-white shadow-md rounded-lg text-xs text-center">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-2 py-1 border">No</th>
                <th className="px-2 py-1 border">Name</th>
                <th className="px-2 py-1 border">Email</th>
                <th className="px-2 py-1 border">Role</th>
                <th className="px-2 py-1 border">Branch</th>
                <th className="px-2 py-1 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-2 text-gray-500">
                    No users available
                  </td>
                </tr>
              ) : (
                users.map((user, index) => (
                  <tr key={user.user_id}>
                    <td className="px-2 py-1 border">{index + 1}</td>
                    <td className="px-2 py-1 border">{user.name}</td>
                    <td className="px-2 py-1 border">{user.email}</td>
                    <td className="px-2 py-1 border">
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </td>
                    <td className="px-2 py-1 border">
                      {user.branch.charAt(0).toUpperCase() + user.branch.slice(1)}
                    </td>
                    <td className="px-2 py-1 border flex justify-center items-center">
                      {isAdmin ? (
                        <div className="relative group flex justify-center items-center">
                          <img
                            src={Update}
                            alt="update"
                            className="h-6 w-6 cursor-pointer"
                            onClick={() => handleUpdateUser(user.user_id)}
                          />
                          <span className="absolute left-1/2 bottom-6 mb-2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs px-2 py-1 rounded-md after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:top-full after:border-4 after:border-transparent after:border-t-gray-800">
                            Update
                          </span>
                        </div>
                      ) : (
                        <div className="relative group flex justify-center items-center">
                          <img
                            src={Update}
                            alt="update"
                            className="h-6 w-6 cursor-not-allowed"
                          />
                          <span className="absolute left-1/2 bottom-6 mb-2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-gray-800 text-white text-xs px-2 py-1 rounded-md after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:top-full after:border-4 after:border-transparent after:border-t-gray-800">
                            Update
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default User;
