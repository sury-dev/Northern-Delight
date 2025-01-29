import React, { useId } from 'react'
import './Input.css'

const Input = React.forwardRef((
    {
        label,
        img,
        type = 'text',
        className = '',
        ...props
    }, ref
) => {
    const id = useId()
    return (
        <div className='inputContainer'>
            <input
            id={id}
            type={type}
            className={`${className}`}
            ref={ref}
            {...props}
        />
        {
            img && img && <img src={img} alt='icon' className='inputIcon' />
        }
        </div>
    )
})

export default Input
