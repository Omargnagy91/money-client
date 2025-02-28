<script>
  import { Onboarding, Text } from '$components/onboarding';
  import { Form, MasterPasswordField } from '$strict';

  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';

  import { FormError } from '$services/errors';
  import { AuthService } from '$services/auth/authService';

  import { currentChestsStore } from '$stores/wallet';
  import { userDecrStore } from '$stores/decr/user';

  export let isFirstPassword: boolean = true;

  let shouldShowSecondPassword = false,
    cleanup = false,
    notificationText: string | undefined;

  const success = async ({ password, password2 }: { password: string; password2?: string }) => {
    if (!shouldShowSecondPassword) {
      shouldShowSecondPassword = true;

      if (isFirstPassword) return null;
      setTimeout(() => {
        cleanup = true;
        notificationText = $_('routes.user.masterPassOk');
      }, 100);
    }

    if (password !== password2)
      throw new FormError({
        code: 0,
        fieldErrors: { password2: [$_('cmps.masterPassword.old.pass.samePasswords')] },
      });

    try {
      await AuthService.setMasterPassword(password, $currentChestsStore, $userDecrStore);
    } catch (error) {
      throw new FormError({
        code: 0,
        message: $_('common.errors.generic'),
      });
    }
  };

  $: help = `${$_('cmps.masterPassword.setNew.help.common')} ${
    isFirstPassword ? '' : $_('cmps.masterPassword.setNew.help.invite')
  }`;
</script>

<Onboarding shouldShow={isFirstPassword}>
  <Form
    {success}
    {cleanup}
    {notificationText}
    buttonText={isFirstPassword ? $_('common.form.set') : $_('common.form.change')}>
    <MasterPasswordField {help} />
    {#if shouldShowSecondPassword}
      <div class="field" in:slide>
        <MasterPasswordField isSecond label={$_('cmps.user.password.labelRepeat')} />
      </div>
    {/if}
  </Form>

  <svelte:fragment slot="text">
    <Text header>{$_('cmps.masterPassword.setNew.onboarding.header')}</Text>
    <Text>
      {@html $_('cmps.masterPassword.setNew.onboarding.main', {
        values: { boldO: '<span class="has-text-weight-bold">', boldC: '</span>' },
      })}
    </Text>
  </svelte:fragment>
</Onboarding>
