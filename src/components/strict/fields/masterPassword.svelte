<script>
  /**
   * Motivation around `type='text'` and `text-security: disc`.
   *
   * Chrome does not allow for disabling autocomplete for password field. At all.
   * https://stackoverflow.com/questions/60689757/how-to-disable-chrome-autofill-after-2020
   * https://stackoverflow.com/questions/12374442/chrome-ignores-autocomplete-off
   *
   * We have two passwords: the usual one for autorization and the master-password.
   * The problem is that we cannot disable the autocomplete for the master-password. So when
   * user gets a prompt for setting a new password, they always get the autorization one.
   * When they set a new master-password it always replaces the authorization one. It also
   * creates a situation where the browser can store master-password which we call the
   * most important password here.
   *
   * So to disable this behaviour we use `type='text'` and `text-security: disc`, which does
   * not work in Firefox, but that's not that important.
   */
  import Field from '$components/strict/field.svelte';
  import TextInput from '$components/strict/inputs/text.svelte';

  import { ensureString, trim, minLength, maxLength } from '$validators';

  export let validate = true,
    help: string | undefined = undefined,
    label: string | undefined = undefined,
    isSecond: boolean = false;

  const field = {
    label,
    name: `password${isSecond ? '2' : ''}`,
    required: true,
    help,
    clean: [ensureString, trim],
    validate: validate ? [minLength(12), maxLength(100)] : [],
  };
</script>

<div class="field">
  <Field {field}>
    <TextInput type="text" placeholder="correct-horse-staple-battery" />
  </Field>
</div>

<style>
  .field :global(input) {
    -webkit-text-security: disc;
  }
</style>
