import ThemeToggle from "../buttons/BtnToggleTheme";

export default function Header({ title, subtitle }) {
    return (
        <div className="header">
            <div className="p-3 shadow-sm">

                <h2 className="fw-bold mb-1">{title}</h2>
                <p className="mb-0">{subtitle}</p>
            </div>
        </div>
    );
}