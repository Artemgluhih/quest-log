import { supabase } from './supabaseClient'

// --- ПРОЕКТЫ ---
export const fetchProjects = async () => {
	const { data, error } = await supabase
		.from('projects')
		.select('*')
		.order('created_at')
	if (error) {
		console.error('Ошибка загрузки проектов:', error)
		throw error
	}
	return data || []
}

export const addProjectToDB = async project => {
	const { error } = await supabase.from('projects').insert([
		{
			id: project.id,
			name: project.name,
			icon: project.icon,
			priority: project.priority,
			xp_multiplier: project.xpMultiplier,
			created_at: project.createdAt || new Date().toISOString(),
		},
	])
	if (error) {
		console.error('Ошибка добавления проекта:', error)
		throw error
	}
}

export const deleteProjectFromDB = async id => {
	const { error } = await supabase.from('projects').delete().eq('id', id)
	if (error) {
		console.error('Ошибка удаления проекта:', error)
		throw error
	}
}

// --- ЗАДАЧИ ---
export const fetchTasks = async () => {
	const { data, error } = await supabase
		.from('tasks')
		.select('*')
		.order('created_at', { ascending: false })
	if (error) {
		console.error('Ошибка загрузки задач:', error)
		throw error
	}
	return data || []
}

export const addTaskToDB = async task => {
	const { error } = await supabase.from('tasks').insert([
		{
			id: task.id,
			title: task.title,
			description: task.description || '',
			project_id: task.projectId,
			completed: task.completed || false,
			priority: task.priority,
			difficulty: task.difficulty,
			xp: task.xp,
			deadline: task.deadline || null,
			subtasks: task.subtasks || [],
			comments: task.comments || [],
			files: task.files || [],
			created_at: task.createdAt || new Date().toISOString(),
		},
	])
	if (error) {
		console.error('Ошибка добавления задачи:', error)
		throw error
	}
}

export const updateTaskInDB = async task => {
	const { error } = await supabase
		.from('tasks')
		.update({
			title: task.title,
			description: task.description,
			project_id: task.projectId,
			completed: task.completed,
			priority: task.priority,
			difficulty: task.difficulty,
			xp: task.xp,
			deadline: task.deadline,
			subtasks: task.subtasks,
			comments: task.comments,
			files: task.files,
		})
		.eq('id', task.id)
	if (error) {
		console.error('Ошибка обновления задачи:', error)
		throw error
	}
}

export const deleteTaskFromDB = async id => {
	const { error } = await supabase.from('tasks').delete().eq('id', id)
	if (error) {
		console.error('Ошибка удаления задачи:', error)
		throw error
	}
}
