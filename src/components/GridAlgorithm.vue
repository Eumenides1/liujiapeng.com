<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

// 路由对象
const router = useRouter();

// 获取所有算法题
const allAlgorithms = computed(() =>
  router
    .getRoutes()
    .filter(
      (route) =>
        route.path.startsWith("/algorithm") &&
        route.meta.frontmatter &&
        route.path !== "/algorithm",
    )
    .map((route) => ({
      path: route.path,
      ...route.meta.frontmatter,
    })),
);

// 筛选条件
const selectedDifficulty = ref<string | null>(null);
const selectedTag = ref<string | null>(null);

// 筛选后的算法列表
const filteredAlgorithms = computed(() => {
  return allAlgorithms.value.filter((algorithm) => {
    const matchesDifficulty = selectedDifficulty.value
      ? algorithm.difficulty === selectedDifficulty.value
      : true;
    const matchesTag = selectedTag.value
      ? algorithm.tags?.includes(selectedTag.value)
      : true;
    return matchesDifficulty && matchesTag;
  });
});

// 获取难度和标签
const difficulties = computed(() =>
  Array.from(new Set(allAlgorithms.value.map((a) => a.difficulty))),
);
const tags = computed(() =>
  Array.from(new Set(allAlgorithms.value.flatMap((a) => a.tags || []))),
);

// 控制标签展开和收起
const showAllTags = ref(false); // 是否显示所有标签
const visibleTags = computed(
  () => (showAllTags.value ? tags.value : tags.value.slice(0, 5)), // 默认显示前5个标签
);
function toggleTags() {
  showAllTags.value = !showAllTags.value;
}

// 更新筛选条件
function selectDifficulty(difficulty: string | null) {
  selectedDifficulty.value = difficulty;
}
function selectTag(tag: string | null) {
  selectedTag.value = tag;
}
</script>

<template>
  <div class="grid-algorithm">
    <h1>100 道算法挑战</h1>

    <!-- 筛选区域 -->
    <div class="filters">
      <!-- 按难度筛选 -->
      <div class="filter-group difficulty">
        <button
          v-for="difficulty in difficulties"
          :key="difficulty"
          :class="{ active: selectedDifficulty === difficulty }"
          @click="
            selectDifficulty(
              difficulty === selectedDifficulty ? null : difficulty,
            )
          "
        >
          {{ difficulty }}
        </button>
      </div>

      <!-- 按标签筛选 -->
      <div class="filter-group tags">
        <div class="tags-container">
          <button
            v-for="(tag, index) in visibleTags"
            :key="tag"
            :class="{ active: selectedTag === tag }"
            @click="selectTag(tag === selectedTag ? null : tag)"
          >
            {{ tag }}
          </button>
        </div>
        <button class="toggle-button" @click="toggleTags">
          <i :class="showAllTags ? 'icon-up' : 'icon-down'" />
        </button>
      </div>
    </div>

    <!-- 算法题网格 -->
    <div class="grid">
      <RouterLink
        v-for="algorithm in filteredAlgorithms"
        :key="algorithm.path"
        :to="algorithm.path"
        class="grid-item"
      >
        <div class="item-header">
          <div class="item-id">#{{ algorithm.id }}</div>
          <div class="item-title">
            {{ algorithm.title }}
          </div>
        </div>
        <div class="item-meta">
          <span class="difficulty" :class="algorithm.difficulty">{{
            algorithm.difficulty
          }}</span>
          <span>{{ algorithm.tags?.join(", ") }}</span>
        </div>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.grid-algorithm {
  padding: 20px;
  font-family: "Arial", sans-serif;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
}

/* 筛选区域 */
.filters {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group button {
  padding: 8px 16px;
  border: none;
  border-radius: 16px;
  background-color: #f1f1f1;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-group button:hover {
  background-color: #e0e0e0;
}

.filter-group button.active {
  background-color: #0078d4;
  color: white;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.toggle-button {
  margin-left: auto;
  font-size: 1rem;
  color: #0078d4;
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.toggle-button:hover {
  color: #0056a3;
}

.toggle-button i {
  font-size: 1.2rem;
}

.icon-up::before {
  content: "▲";
}

.icon-down::before {
  content: "▼";
}

/* 算法网格 */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.grid-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.item-header {
  margin-bottom: 8px;
}

.item-id {
  font-weight: bold;
  font-size: 1rem;
  color: #333;
}

.item-title {
  font-size: 1.2rem;
  margin-top: 4px;
  color: #555;
}

.item-meta {
  font-size: 0.9rem;
  color: #777;
  margin-top: auto;
  display: flex;
  justify-content: space-between;
}

.difficulty {
  font-weight: bold;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

.difficulty.简单 {
  color: #1f8c1f;
  background: #e8fbe8;
}

.difficulty.中等 {
  color: #f9a825;
  background: #fff4e6;
}

.difficulty.困难 {
  color: #d32f2f;
  background: #fdeaea;
}
</style>
