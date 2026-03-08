class CodeNode:
    def __init__(self, name):
        self.name = name
        self.dependencies = []

class CodeGraph:
    def __init__(self):
        self.nodes = {}

    def add_node(self, name):
        if name not in self.nodes:
            self.nodes[name] = CodeNode(name)

    def add_dependency(self, file_name, depends_on):
        self.add_node(file_name)
        self.add_node(depends_on)
        self.nodes[file_name].dependencies.append(depends_on)


def build_code_graph(files: list) -> CodeGraph:
    """
    Construye un grafo de dependencias basado en reglas estáticas simples
    (o que en un sistema real puede derivar del LLM respondiendo con las adyacencias).
    """
    graph = CodeGraph()
    for f in files:
        graph.add_node(f)

    # Reglas heurísticas de grafo
    # Ej: Los services dependen de los models.
    # Los APIs dependen de los services.
    
    models = [f for f in files if "models/" in f]
    services = [f for f in files if "services/" in f]
    apis = [f for f in files if "api/" in f]
    pages = [f for f in files if "pages/" in f]
    
    for service_file in services:
        for model in models:
            graph.add_dependency(service_file, model)
            
    for api_file in apis:
        for service in services:
            graph.add_dependency(api_file, service)
            
    for page in pages:
        for api_file in apis:
            graph.add_dependency(page, api_file)
            
    return graph


def topo_sort(graph: CodeGraph) -> list:
    """
    Ordenamiento topológico para decidir qué archivos generar primero.
    """
    visited = set()
    order = []

    def dfs(node):
        if node in visited:
            return
        visited.add(node)
        
        # Primero procesamos sus dependencias
        for dep in graph.nodes[node].dependencies:
            dfs(dep)
            
        if node not in order:
            order.append(node)

    for node in list(graph.nodes.keys()):
        dfs(node)

    return order
