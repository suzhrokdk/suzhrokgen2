<template>
  <div class="app-container">
    <h1>Todo アプリ</h1>
    
    <!-- Todo追加フォーム -->
    <div class="todo-form">
      <input
        v-model="newTodoContent"
        @keyup.enter="addTodo"
        placeholder="新しいTodoを入力..."
        class="todo-input"
      />
      <button @click="addTodo" class="add-button">追加</button>
    </div>

    <!-- ローディング表示 -->
    <div v-if="loading" class="loading">読み込み中...</div>

    <!-- エラー表示 -->
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Todoリスト -->
    <div class="todo-list">
      <div
        v-for="todo in todos"
        :key="todo.id"
        class="todo-item"
      >
        <input
          type="text"
          v-model="todo.content"
          @blur="updateTodo(todo)"
          class="todo-content-input"
        />
        <button @click="deleteTodo(todo.id)" class="delete-button">削除</button>
      </div>
      
      <div v-if="todos.length === 0 && !loading" class="empty-message">
        Todoがありません。新しいTodoを追加してください。
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { generateClient } from 'aws-amplify/data'

const client = generateClient()

export default {
  name: 'App',
  setup() {
    const todos = ref([])
    const newTodoContent = ref('')
    const loading = ref(false)
    const error = ref('')

    // Todo一覧を取得
    const fetchTodos = async () => {
      try {
        loading.value = true
        error.value = ''
        const { data: todoList } = await client.models.Todo.list()
        todos.value = todoList || []
      } catch (err) {
        error.value = 'Todoの取得に失敗しました: ' + err.message
        console.error('Error fetching todos:', err)
      } finally {
        loading.value = false
      }
    }

    // Todoを追加
    const addTodo = async () => {
      if (!newTodoContent.value.trim()) return

      try {
        error.value = ''
        await client.models.Todo.create({
          content: newTodoContent.value.trim()
        })
        newTodoContent.value = ''
        await fetchTodos()
      } catch (err) {
        error.value = 'Todoの追加に失敗しました: ' + err.message
        console.error('Error creating todo:', err)
      }
    }

    // Todoを更新
    const updateTodo = async (todo) => {
      try {
        error.value = ''
        await client.models.Todo.update({
          id: todo.id,
          content: todo.content
        })
      } catch (err) {
        error.value = 'Todoの更新に失敗しました: ' + err.message
        console.error('Error updating todo:', err)
        await fetchTodos() // エラー時は再取得
      }
    }

    // Todoを削除
    const deleteTodo = async (id) => {
      try {
        error.value = ''
        await client.models.Todo.delete({ id })
        await fetchTodos()
      } catch (err) {
        error.value = 'Todoの削除に失敗しました: ' + err.message
        console.error('Error deleting todo:', err)
      }
    }

    // コンポーネントマウント時にTodo一覧を取得
    onMounted(() => {
      fetchTodos()
    })

    return {
      todos,
      newTodoContent,
      loading,
      error,
      addTodo,
      updateTodo,
      deleteTodo
    }
  }
}
</script>

<style scoped>
.app-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #2c3e50;
  margin-bottom: 30px;
}

.todo-form {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
}

.todo-input {
  flex: 1;
  padding: 12px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.todo-input:focus {
  border-color: #42b983;
}

.add-button {
  padding: 12px 24px;
  font-size: 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-button:hover {
  background-color: #35a372;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.todo-item {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #eee;
}

.todo-content-input {
  flex: 1;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
  background-color: white;
}

.todo-content-input:focus {
  border-color: #42b983;
}

.delete-button {
  padding: 8px 16px;
  font-size: 14px;
  background-color: #ff6b6b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-button:hover {
  background-color: #ee5a5a;
}

.empty-message {
  text-align: center;
  padding: 40px;
  color: #999;
  font-style: italic;
}
</style>
