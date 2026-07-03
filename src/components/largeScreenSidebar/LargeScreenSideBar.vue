
<template>
  <div class="side_gutter">
    <div class="logo-wrapper">
      <img
        src="https://avatars.githubusercontent.com/u/131537619?v=4"
        width="50"
        height="50"
        class="profile-img"
      />
    </div>
    <ul class="list-container">
      <li class="list active">
        <div class="tooltip">Home</div>
        <img
          class="home_ic"
          src="https://img.icons8.com/?size=100&id=73&format=png&color=000000"
          width="22"
          height="22"
        />
      </li>
    </ul>
  </div>
</template>

<style lang="css" scoped>
.side_gutter {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 98%;
  margin-block: 10px;
  border-radius: 1rem;
  padding: 1.25rem 0.75rem;
  gap: 2.5rem;
  background: var(--sidebar-bg, linear-gradient(180deg, #ffffff 0%, #f8faff 100%));
  border: 1px solid var(--sidebar-border, rgba(99, 102, 241, 0.15));
  box-shadow:
    0 0 20px rgba(99, 102, 241, 0.06),
    inset 0 0 0 1px rgba(255, 255, 255, 0.8);
  position: relative;
}

.logo-wrapper {
  position: relative;
}

.logo-wrapper::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  opacity: 0.2;
  z-index: -1;
}

.profile-img {
  border-radius: 4rem;
  display: block;
  position: relative;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.2);
}

.list-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 0;
  width: 100%;
}

.list {
  list-style: none;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.list:hover {
  transform: scale(1.05);
}

.list:hover .tooltip {
  opacity: 1;
  visibility: visible;
}

.tooltip {
  position: absolute;
  left: calc(100% + 10px);
  top: 50%;
  transform: translateY(-50%);
  background: #1f2937;
  color: white;
  font-size: 0.7rem;
  padding: 0.3rem 0.6rem;
  border-radius: 0.35rem;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.15s ease;
  pointer-events: none;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.tooltip::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: #1f2937;
}

.home_ic {
  width: 42px;
  height: 42px;
  padding: 10px;
  border-radius: 0.85rem;
  background: linear-gradient(135deg, #eef2ff, #e0e7ff);
  box-shadow:
    0 2px 6px rgba(99, 102, 241, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(99, 102, 241, 0.3);
  transition: all 0.2s ease;
}

.list.active .home_ic {
  background: linear-gradient(135deg, #6366f1, #818cf8);
  border-color: #6366f1;
  box-shadow:
    0 4px 12px rgba(99, 102, 241, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.nav-icon {
  width: 42px;
  height: 42px;
  padding: 10px;
  border-radius: 0.85rem;
  background: var(--bg-tertiary, #f9fafb);
  border: 1px solid var(--border, #e5e7eb);
  transition: all 0.2s ease;
  opacity: 0.5;
}

.nav-icon:hover {
  opacity: 0.8;
  background: var(--bg-tertiary, #f3f4f6);
  border-color: var(--input-border, #d1d5db);
}
</style>
