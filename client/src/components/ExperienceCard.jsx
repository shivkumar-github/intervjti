import React from 'react'

function ExperienceCard(exp) {
  return (
	  <>
		  <p>Student Name : {exp.studentName}</p>
		  <p>Company Name : {exp.companyName}</p>
		  <p>batch : {exp.batch}</p>
		  <p>Experience : {exp.expText}</p>
	  </>
  )
}

export default ExperienceCard
