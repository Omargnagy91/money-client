import type { Writable } from 'svelte/store';
import { derived, readable } from 'svelte/store';

import { post, request } from '$services/request';
import { schemeStore } from '$stores/scheme';
import { metaCategoryStore } from '$stores/metaCategory';
import { mccStore, updateMccDescriptions } from '$stores/mcc';

type Currency = { label: string; code: string };

const prefix = '/directory';

export const currencyListStore = readable<Currency[] | null>(null, set => {
  request<Currency[]>({ path: `${prefix}/currency` }).then(({ json }) => set(json));
});

const getSyncGenericStore = <T extends { id: string; updated: number }>(
  store: Writable<{ [id: string]: T }>,
  path: string,
) => {
  let prevLatestUpdated = -1;

  const getMaxFromEnts = (ents: T[]) =>
    ents.length ? Math.max(...ents.map(ent => ent.updated)) : 0;

  return derived(store, $state => {
    const ents = Object.values($state),
      latestUpdated = getMaxFromEnts(ents);

    if (prevLatestUpdated !== latestUpdated) {
      prevLatestUpdated = latestUpdated;
      request<T[]>({
        path: `${prefix}/${path}`,
        queryParams: { from: latestUpdated.toString() },
      }).then(({ json }) => {
        prevLatestUpdated = getMaxFromEnts(json);
        store.set(
          json.reduce<{ [id: string]: T }>((acc, curr) => ((acc[curr.id] = curr), acc), {}),
        );
      });
    }
  });
};

export const updateSchemes = getSyncGenericStore(schemeStore, 'scheme'),
  updateMetaCategories = getSyncGenericStore(metaCategoryStore, 'meta-category');

export const requestMccDescription = (codeList: string[]) =>
  request<{ code: string; description: string | null }[]>({
    method: post,
    path: `${prefix}/mcc`,
    data: { codeList },
  }).then(({ json }) => updateMccDescriptions(json));

export const getMccDescriptionStore = derived(mccStore, $mcc => (code: string) => {
  const result = $mcc[code];

  if (typeof result !== 'undefined') return result;
  requestMccDescription([code]);
});
