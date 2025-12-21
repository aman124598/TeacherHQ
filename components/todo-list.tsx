"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"

import { useAuth } from "@/lib/firebase/AuthContext"
import { getUserTodos, addUserTodo, updateUserTodo, deleteUserTodo, TodoData } from "@/lib/firebase/firestore"

interface Todo {
  id: string
  text: string
  completed: boolean
}

export default function TodoList() {
  const { user } = useAuth()
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function loadTodos() {
       if (!user) return
       try {
         const data = await getUserTodos(user.uid)
         setTodos(data.map((t: any) => ({ 
             id: t.id, 
             text: t.text, 
             completed: t.completed 
         })))
       } catch (error) {
         console.error("Failed to load todos", error)
       }
    }
    loadTodos()
  }, [user])

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newTodo.trim() === "" || !user) return

    const todoText = newTodo
    setNewTodo("") // Clear input immediately for better UX
    
    try {
      // Optimistic update
      const tempId = Date.now().toString()
      const tempTodo = { id: tempId, text: todoText, completed: false }
      setTodos([...todos, tempTodo])

      const result = await addUserTodo({
          userId: user.uid,
          text: todoText,
          completed: false
      })
      
      if (result.success && result.id) {
          // Replace temp ID with real ID
          setTodos(current => current.map(t => t.id === tempId ? { ...t, id: result.id! } : t))
      }
    } catch (error) {
        console.error("Failed to add todo", error)
        // Revert on error could be implemented here
    }
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return

    // Optimistic update
    setTodos(todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))

    try {
        await updateUserTodo(id, { completed: !todo.completed })
    } catch (error) {
        console.error("Failed to update todo", error)
    }
  }

  const deleteTodo = async (id: string) => {
    // Optimistic update
    setTodos(todos.filter((t) => t.id !== id)) 

    try {
        await deleteUserTodo(id)
    } catch(error) {
        console.error("Failed to delete todo", error)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addTodo} className="flex gap-2">
        <Input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1"
        />
        <Button type="submit">Add</Button>
      </form>

      <div className="space-y-2">
        {todos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">No tasks yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first task above to get started!</p>
          </div>
        ) : (
          todos.map((todo) => (
            <div key={todo.id} className="flex items-center justify-between p-3 border rounded-md bg-card">
              <div className="flex items-center gap-2">
                <Checkbox id={`todo-${todo.id}`} checked={todo.completed} onCheckedChange={() => toggleTodo(todo.id)} />
                <label
                  htmlFor={`todo-${todo.id}`}
                  className={`text-sm ${todo.completed ? "line-through text-muted-foreground" : ""}`}
                >
                  {todo.text}
                </label>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteTodo(todo.id)}
                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
