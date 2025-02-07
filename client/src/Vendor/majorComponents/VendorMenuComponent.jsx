import React, {useState, useEffect} from 'react'
import './VendorMenuComponent.css'

function VendorMenuComponent() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="vendorMenuComponent w-full h-full relative">{/*  */}
            <div className="header"> {/* CSS in EmployeeComponent.css  */}
                <div className="header-left">
                    <h3>
                        Total Categories: <span className="totalEmployees">2</span>
                    </h3>
                    <h3>
                        Food Items: <span className="activeEmployees">5</span>
                    </h3>
                    <h3>
                        Combos: <span className="inactiveEmployees">7</span>
                    </h3>
                </div>
            </div>
        </div>
    )
}

export default VendorMenuComponent
