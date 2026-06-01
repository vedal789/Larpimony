import { useState } from 'react';

export default function HeaderBar() {
	const [projectName, setProjectName] = useState('Untitled Project');

	return (
		<div className="header-bar">
			<div className="header-logo">
				{/* <img src="/static/Logo-Dark.svg" alt="Antimony Logo" style={{ height: '24px', marginRight: '8px' }} /> */}
				<span>Antimony</span>
			</div>
			<div className="header-project-name">
				<input
					type="text"
					value={projectName}
					onChange={(e) => setProjectName(e.target.value)}
				/>
			</div>
		</div>
	);
}
