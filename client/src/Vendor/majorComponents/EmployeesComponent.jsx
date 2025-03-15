import React, { useState, useEffect } from "react";
import vendorService from "../../server/vendorService";
import { EmployeeCard } from "../UI";
import "./EmployeesComponent.css";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function EmployeesComponent() {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [fetchingError, setFetchingError] = useState(false);
    const [loading, setLoading] = useState(true);

    const vendorRole = useSelector(state => state.auth.role);
    const navigate = useNavigate();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        if (vendorRole !== "admin") {
            navigate('/vendor/Orders');
        } else {
            setIsAuthorized(true);
        }
    }, [vendorRole, navigate]);

    useEffect(() => {
        vendorService
            .getAllEmployees({ search: "" })
            .then((response) => {
                if (response && response.status === 200) {
                    setEmployees(response.data.data);
                    setFilteredEmployees(response.data.data); // Initially show all employees
                } else {
                    console.log("EmployeesComponent :: useEffect :: employees :: error :: ", response);
                    setFetchingError(true);
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error("Error fetching employees:", error);
                setFetchingError(true);
                setLoading(false);
            });
    }, []);

    // Count active and inactive employees
    const activeEmployees = employees.filter(emp => emp.active).length;
    const inactiveEmployees = employees.length - activeEmployees;

    // Handle the search input change
    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchTerm(query);

        // Filter employees based on the search query and status filter
        const filtered = employees.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(query) ||
                emp.email.toLowerCase().includes(query) ||
                emp.username.toLowerCase().includes(query) ||
                emp.phoneNumber.toLowerCase().includes(query) ||
                emp.jobTitle.toLowerCase().includes(query) ||
                emp.vid.toLowerCase().includes(query);

            const matchesStatus = statusFilter === "All" ||
                (statusFilter === "Active" && emp.active) ||
                (statusFilter === "Inactive" && !emp.active);

            return matchesSearch && matchesStatus;
        });

        setFilteredEmployees(filtered);
    };

    // Handle the radio button selection change
    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    const toggleEmployeeActivation = async (employeeId) => {
        const response = await vendorService.toggleEmployeeActivation(employeeId);
        if (response && response.status === 200) {
            const updatedEmployees = employees.map(emp => {
                if (emp._id === employeeId) {
                    return { ...emp, active: !emp.active };
                }
                return emp;
            });
            setEmployees(updatedEmployees);
            setFilteredEmployees(updatedEmployees);
        } else {
            console.error("Error toggling employee activation:", response);
        }
    }

    const deleteEmployee = async (employeeId) => {
        const response = await vendorService.deleteEmployee(employeeId);
        if (response && response.status === 200) {
            const updatedEmployees = employees.filter(emp => emp._id !== employeeId);
            setEmployees(updatedEmployees);
            setFilteredEmployees(updatedEmployees);
        } else {
            console.error("Error deleting employee:", response);
        }
    }

    useEffect(() => {
        handleSearch({ target: { value: searchTerm } }); // Apply filter immediately after changing the status filter
    }, [statusFilter]);

    if (!isAuthorized) {
        return null; // Prevents rendering if unauthorized
    }

    return (
        <div className="employeesComponent w-full h-full relative">
            <div className="header">
                <div className="header-left">
                    <h3>
                        Total Employees: <span className="totalEmployees">{employees.length}</span>
                    </h3>
                    <h3>
                        Active Employees: <span className="activeEmployees">{activeEmployees}</span>
                    </h3>
                    <h3>
                        Inactive Employees: <span className="inactiveEmployees">{inactiveEmployees}</span>
                    </h3>
                </div>
                <div className="header-right">
                    <input
                        type="text"
                        placeholder="Search Employees"
                        id="searchBox"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    <div className="status-filters">
                        <input
                            type="radio"
                            name="status"
                            id="All"
                            value="All"
                            checked={statusFilter === "All"}
                            onChange={handleStatusFilterChange}
                        />
                        <label htmlFor="All">All</label>

                        <input
                            type="radio"
                            name="status"
                            id="Active"
                            value="Active"
                            checked={statusFilter === "Active"}
                            onChange={handleStatusFilterChange}
                        />
                        <label htmlFor="Active">Active</label>

                        <input
                            type="radio"
                            name="status"
                            id="Inactive"
                            value="Inactive"
                            checked={statusFilter === "Inactive"}
                            onChange={handleStatusFilterChange}
                        />
                        <label htmlFor="Inactive">Inactive</label>
                    </div>
                </div>
            </div>

            {loading && <p>Loading employees...</p>}
            {fetchingError && <p>Error fetching employees. Please try again.</p>}

            {/* Optional: Display employee list if needed */}
            <div className="employee-card-container">
                {filteredEmployees.map(emp => (
                    <EmployeeCard key={emp._id} {...emp} toggleEmployeeActivation={toggleEmployeeActivation} deleteEmployee={deleteEmployee} />
                ))}
            </div>
        </div>
    );
}

export default EmployeesComponent;
