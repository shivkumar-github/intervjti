import { NavLink } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function NavBar() {
	const { isLoggedIn, role } = useAuth();
	const navLinks = [
		{ to: "/", label: "Home", show: true },
		{ to: "/admindashboard", label: "Admin Dashboard", show: role === 'admin' },
		{ to: "/loginpage", label: "Login", show: !isLoggedIn },
		{ to: "/signup", label: "Sign Up", show: !isLoggedIn },
		{ to: "/myexperiencespage", label: "My Experiences", show: isLoggedIn && role=== 'student' },
		{ to: "/uploadpage", label: "Upload Experience", show: isLoggedIn },
	]

	return (
		<nav className="bg-white border-b border-gray-200">
			<div className="max-w-6xl mx-auto px-6">
				<div className="flex justify-between items-center h-16">
					<h1 className="text-lg font font-semibold text-gray-800">
						InterVJTI
					</h1>
					<ul className="flex items-center gap-6 text-gray-600 font-medium">
						{navLinks
							.filter(link => link.show)
							.map(link => (
								<li key={link.to}>
									<NavLink
										to={link.to}
										className='hover:text-blue-600 transition-colors'
									>{ link.label}</NavLink>
								</li>
							))
						}
					</ul>
				</div>
			</div>
		</nav>
	);
};
