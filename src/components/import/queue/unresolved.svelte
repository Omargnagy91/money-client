<script>
  import type {
    Category,
    FullEntity,
    OmitCommonFields,
    Transaction,
    WalletUser,
  } from '$stores/decr/types';
  import type { CsvParsedTransactionResolution } from '$core/import/constants';

  import CrossfadeWrapper from '$components/elements/crossfadeWrapper.svelte';
  import ParsedTransactionData from './parsedTransactionData.svelte';
  import SubmitButtons from './submitButtons.svelte';
  import ZeroData from '$components/elements/zeroData.svelte';
  import { Onboarding, Text } from '$components/onboarding';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  export let transactionToResolve: OmitCommonFields<Transaction> | undefined,
    suggestedCategoryIds: string[] | undefined,
    category: FullEntity<Category> | undefined = undefined,
    walletUser: FullEntity<WalletUser> | undefined = undefined,
    defaultWalletUserId: string,
    showOnboarding = false;

  let submitDisabled = false,
    showEdit: boolean,
    resolution: CsvParsedTransactionResolution;

  const submit = ({ detail: innerResolution }: CustomEvent<CsvParsedTransactionResolution>) => {
      resolution = innerResolution;
      dispatch('triggerManualSubmit', resolution);
    },
    success = ({ detail }: CustomEvent<OmitCommonFields<Transaction>>) =>
      dispatch('success', { transaction: detail, resolution });

  type OnboardingSteps = 'card' | 'submit';
  let currentStep: OnboardingSteps = 'card';
</script>

{#if transactionToResolve}
  <div class="wrapper">
    <Onboarding preventSlotClick bottom shouldShow={showOnboarding && currentStep == 'submit'}>
      <div class="mb-5">
        <SubmitButtons {submitDisabled} on:submit={submit} />
      </div>

      <svelte:fragment slot="text">
        <Text>{$_('cmps.import.queue.onboarding.saveTransactions')}</Text>
        <button class="button mt-3" on:click={() => dispatch('onboardingFinish')}
          >{$_('common.allClear')}</button>
      </svelte:fragment>
    </Onboarding>

    <CrossfadeWrapper key={JSON.stringify(transactionToResolve)}>
      <Onboarding preventSlotClick shouldShow={showOnboarding && currentStep == 'card'}>
        <div class="box" class:box--hoverable={!showEdit} class:my-4={showEdit}>
          <ParsedTransactionData
            {suggestedCategoryIds}
            {category}
            {walletUser}
            {defaultWalletUserId}
            transaction={transactionToResolve}
            bind:submitDisabled
            bind:showEdit
            on:success={success} />
        </div>
        <svelte:fragment slot="text">
          <Text header>{$_('cmps.import.queue.onboarding.parsed.header')}</Text>
          <Text>{$_('cmps.import.queue.onboarding.parsed.main')}</Text>
          <button class="button mt-3" on:click={() => (currentStep = 'submit')}
            >{$_('common.form.ok')}</button>
        </svelte:fragment>
      </Onboarding>
    </CrossfadeWrapper>
  </div>
{:else}
  <div>
    <ZeroData text={$_('cmps.import.queue.zeroData') + ' 👍'} />
  </div>
{/if}

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    place-items: center;

    padding: 1em;
  }
</style>
