import { defineStore } from 'pinia';
import type { PaletteOption } from './command-palette.types';
import { useToolStore } from '@/tools/tools.store';
import { useFuzzySearch } from '@/composable/fuzzySearch';
import { useStyleStore } from '@/stores/style.store';

import SunIcon from '~icons/mdi/white-balance-sunny';
import BugIcon from '~icons/mdi/bug-outline';
import DiceIcon from '~icons/mdi/dice-5';
import InfoIcon from '~icons/mdi/information-outline';

export const useCommandPaletteStore = defineStore('command-palette', () => {
  const toolStore = useToolStore();
  const styleStore = useStyleStore();
  const router = useRouter();
  const searchPrompt = ref('');

  const toolsOptions = toolStore.tools.map(tool => ({
    ...tool,
    to: tool.path,
    toolCategory: tool.category,
    category: 'Tools',
  }));

  const searchOptions: PaletteOption[] = [
    ...toolsOptions,
    {
      name: 'Random tool',
      description: 'Get a random tool from the list.',
      action: () => {
        const randomTool = toolStore.tools[Math.floor(Math.random() * toolStore.tools.length)];
        if (randomTool) {
          router.push(randomTool.path);
        }
      },
      icon: DiceIcon,
      category: 'Tools',
      keywords: ['random', 'tool', 'pick', 'choose', 'select'],
      closeOnSelect: true,
    },
    {
      name: 'Toggle dark mode',
      description: 'Toggle dark mode on or off.',
      action: () => styleStore.toggleDark(),
      icon: SunIcon,
      category: 'Actions',
      keywords: ['dark', 'theme', 'toggle', 'mode', 'light', 'system'],
    },
    {
      name: 'Contact & Support',
      description: 'Report a bug, suggest an idea, or contact the DevTol team.',
      to: '/legal/contact',
      category: 'Actions',
      keywords: ['report', 'issue', 'bug', 'problem', 'error', 'contact', 'support'],
      icon: BugIcon,
    },
    {
      name: 'About',
      description: 'Learn more about DevTol.',
      to: '/about',
      category: 'Pages',
      keywords: ['about', 'learn', 'more', 'info', 'information'],
      icon: InfoIcon,
    },
  ];

  const { searchResult } = useFuzzySearch({
    search: searchPrompt,
    data: searchOptions,
    options: {
      keys: [{ name: 'name', weight: 2 }, 'description', 'keywords', 'category'],
      threshold: 0.3,
    },
  });

  const filteredSearchResult = computed(() => {
    const grouped: Record<string, PaletteOption[]> = {};
    for (const item of searchResult.value) {
      const cat = item.category || 'Other';
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      if (grouped[cat].length < 5) {
        grouped[cat].push(item);
      }
    }
    return grouped;
  });

  return {
    filteredSearchResult,
    searchPrompt,
  };
});
