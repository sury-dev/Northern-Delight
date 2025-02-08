import React from 'react'
import './EmployeeCard.css'

function EmployeeCard({ _id, name, username, email, phoneNumber, vid, active, jobTitle, createdAt, updatedAt, avatar , toggleEmployeeActivation, deleteEmployee }) {
    return (
        <div className='employee-card'>
            <div className='employee-profile-picture-section'>
                <div className="employee-image-container">
                    <img src={avatar?.url} alt={name} />
                </div>
                <div className="employee-info">
                    <h3>{name}</h3>
                    <h4>{username}</h4>
                    <p className={active ? "active": ""}>{active ? "Active" : "Inactive"}</p>
                </div>
            </div>
            <div className="employee-card-divider"></div>
            <div className="employee-details">
                <div className="employee-details-item">
                    <img src="/ID.png" alt="ID" />
                    <p>{vid}</p>
                </div>
                <div className="employee-details-item">
                    <img src="/JobTitle.png" alt="Job Title" />
                    <p>{jobTitle}</p>
                </div>
                <div className="employee-details-item">
                    <img src="/Mail.png" alt="Email" />
                    <p>{email}</p>
                </div>
                <div className="employee-details-item">
                    <img src="/Phone.png" alt="Phone" />
                    <p>{phoneNumber}</p>
                </div>
                <div className="employee-details-item">
                    <img src="/Time.png" alt="Created At" />
                    <p>{new Date(createdAt).toLocaleDateString("en-GB")}</p>
                </div>
            </div>
            <div className="employee-ctc-btns">
                <button className={active ? "employee-ctc-btn" : "employee-ctc-btn safe"} onClick={() => {toggleEmployeeActivation(_id)}}>{active ? "Deactivate" : "Activate"}</button>
                <button className="employee-ctc-btn" onClick={() => {deleteEmployee(_id)}}>Delete</button>
            </div>
        </div>
    )
}

export default EmployeeCard
