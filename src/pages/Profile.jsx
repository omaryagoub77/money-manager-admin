import React from 'react'

const Profile = () => {
  return (
    <>
    <div>
        <h1>Create your porfile</h1>
    <form action="">
 <input type="text" placeholder='Your full name ' />
 <input type="email" placeholder='Your email' name="" id="" />
 <input type="number" placeholder='You phone number ' name="" id="" />
 <input type="number" placeholder='You Age  ' name="" id="" />
 <option value="">
    <select name="male" id="">Male</select>
    <select name="female" id="">Female</select>
 </option>
 <input type="file" placeholder='Upload your photo' />
 <button type='submit'>Create account</button>
    </form>
        
    </div>
    </>
  )
}

export default Profile