<script lang="ts" setup>
import type { CSSProperties } from 'vue'

const prop = defineProps<{
  isIcon?: boolean
  iconSrc?: string
  title: string
  titleStyle?: CSSProperties
  subTitle?: string
  value?: string
  valueStyle?: CSSProperties
  subTitleStyle?: CSSProperties
  style?: CSSProperties
}>()
</script>

<template>
  <div class="tile" :style="{ ...prop.style }">
    <!--Leading-->
    <div class="head">
      <img :src="prop.iconSrc" class="icon" v-if="prop.isIcon" />
      <Strong class="title" :style="{ ...prop.titleStyle }">{{ prop.title }}</Strong>
    </div>

    <!--Title-->
    <div class="body">
      <span v-if="value?.length !== 0" class="value" :style="{ ...prop.valueStyle }">{{
        prop.value
      }}</span>
      <span v-if="subTitle?.length !== 0" class="sub-title" :style="{ ...prop.subTitleStyle }">{{
        prop.subTitle
      }}</span>
    </div>

    <div class="trailing"></div>
  </div>
</template>

<style lang="css" scoped>
.tile {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  border-radius: 1rem;
  align-items: center;
  gap: 0.5rem;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  line-height: 1rem;
}

.head {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
}

.title {
  color: black;
}

.sub-title {
  color: grey;
}

.value {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: rgba(182, 182, 182, 0.63);
  color: black;
}
</style>
