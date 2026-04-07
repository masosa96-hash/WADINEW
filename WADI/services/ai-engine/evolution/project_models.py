from typing import List, Optional, Literal
from pydantic import BaseModel, Field

class ProjectMilestone(BaseModel):
    title: str = Field(..., description="Short title of the milestone (e.g., 'MVP Launch')")
    description: str = Field(..., description="Key objectives of this phase")

class WadiProjectContext(BaseModel):
    """
    Project Blueprint model consumed by the Frontend (ProjectBlueprint.tsx).
    Synchronized with '@wadi/db-types'.
    """
    project_name: str = Field(..., description="Creative name for the vision")
    summary: str = Field(..., description="Two-line high-level description")
    tech_stack: List[str] = Field(default_factory=list, description="Recommended technology stack")
    milestones: List[ProjectMilestone] = Field(default_factory=list, description="Roadmap milestones")
    priority: Literal["High", "Medium", "Low"] = Field(default="Medium")
    
    @classmethod
    def sanitize(cls, data: dict) -> "WadiProjectContext":
        """
        Ensures the AI output matches the schema, providing defaults if fields are missing.
        Prevents frontend runtime errors when UI-Syncing.
        """
        # Ensure tech_stack is a list
        if "tech_stack" not in data or not isinstance(data["tech_stack"], list):
            data["tech_stack"] = ["TypeScript", "General"]
            
        # Ensure milestones is valid
        if "milestones" not in data or not isinstance(data["milestones"], list):
            data["milestones"] = [
                {"title": "Initial Setup", "description": "Defining core project structure"}
            ]
            
        # Ensure string fields are present
        data.setdefault("project_name", "WADI Vision Evolution")
        data.setdefault("summary", "A distilled vision of your innovative project idea.")
        
        # Ensure priority is one of the allowed literals
        if data.get("priority") not in ["High", "Medium", "Low"]:
            data["priority"] = "Medium"
            
        return cls(**data)

### AI PROMPT INSTRUCTIONS (FOR LLM) ###
"""
INSTRUCCIONES DE FORMATU PARA WADI:
Siempre responde con un JSON válido que siga este esquema para el ProjectContext:

{
  "project_name": "Nombre Creativo",
  "summary": "Resumen de dos líneas",
  "tech_stack": ["React", "Python", "Supabase"],
  "milestones": [
    { "title": "Setup", "description": "Configuración inicial" },
    { "title": "MVP", "description": "Funcionalidad mínima viable" }
  ],
  "priority": "High" | "Medium" | "Low"
}

ESTO ES CRÍTICO PARA LA SINCRONIZACIÓN CON EL FRONTEND (ProjectBlueprint.tsx).
"""
