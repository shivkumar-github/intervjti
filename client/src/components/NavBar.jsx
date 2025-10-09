import { NavLink } from "react-router-dom"

export default function NavBar() {
  return (
	  <nav>
		  <ul>
			  <li>
				  <NavLink to={"/"}>Home</NavLink>
			  </li>
			  <li>
				  <NavLink to={"/signup"}>Sign Up</NavLink>
			  </li>
			  <li>
				  <NavLink to={"/admindashboard"}>Admin Dashboard</NavLink>
			  </li>
			  <li>
				  <NavLink to={"/loginpage"}>Login</NavLink>
			  </li>
			  <li>
				  <NavLink to={"/uploadpage"}>Upload Experience</NavLink>
			  </li>
		  </ul>
	</nav>
  )
}
