/* pithos-crypt.c
 *
 * Copyright (C) 2017 Patrick Griffis <tingping@tingping.se>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


#include "pithos-crypt.h"
#include <string.h>
#include <glib.h>
#include <nettle/blowfish.h>
#include <nettle/base16.h>


/**
 * pithos_decrypt_string:
 * @input: String to decrypt
 *
 * Returns: Decrypted bytes or %NULL
 */
static gchar *
pithos_decrypt_string (const char * const input)
{
	const size_t input_size = strlen (input);
    const size_t output_size = BASE16_DECODE_LENGTH(input_size);
	guchar *output = g_new0 (guchar, output_size + 1);
    struct base16_decode_ctx b16_ctx;
    size_t generated_len;

    base16_decode_init (&b16_ctx);
    if (!base16_decode_update (&b16_ctx, &generated_len, output, input_size, (guchar*)input))
    {
        g_warning ("Failed to decode data");
        g_free (output);
        return NULL;
    }
    if (!base16_decode_final (&b16_ctx))
    {
        g_warning ("Failed to decode end of data");
        g_free (output);
        return NULL;
    }
    if (generated_len % BLOWFISH_BLOCK_SIZE != 0)
    {
        g_warning ("Invalid length of decoded data");
        g_free (output);
        return NULL;
    }

    struct blowfish_ctx bfish_ctx;
    blowfish_set_key (&bfish_ctx, strlen("R=U!LH$O2B#"), (guchar*)"R=U!LH$O2B#");
    blowfish_decrypt (&bfish_ctx, generated_len, output, output);

    return (char*)output;
}


/**
 * pithos_decrypt_string:
 * @input: String to decrypt
 *
 * Returns: Timestamp or 0 on failure
 */
time_t
pithos_decrypt_time (const char * const input)
{
    char *decrypted = pithos_decrypt_string (input);
    if (decrypted == NULL)
        return 0;

    /* The timestamp starts with random bytes */
    time_t ret = g_ascii_strtoll (decrypted + 4, NULL, 0);
    g_free (decrypted);
    return ret;
}


/**
 * pithos_encrypt_string:
 * @input: String to encrypt
 *
 * Returns: base16 encoded string
 */
char *
pithos_encrypt_string (const char *input)
{
	const size_t input_size = strlen (input);
	const size_t padded_size = (input_size % BLOWFISH_BLOCK_SIZE == 0) ? input_size
                                : input_size + (BLOWFISH_BLOCK_SIZE - input_size % BLOWFISH_BLOCK_SIZE);

	guchar *padded_input = g_new0 (guchar, padded_size + 1);
    strcpy ((char*)padded_input, input);

    struct blowfish_ctx ctx;
    blowfish_set_key (&ctx, strlen("6#26FRL$ZWD"), (guchar*)"6#26FRL$ZWD");
    blowfish_encrypt (&ctx, padded_size, padded_input, padded_input);

	guchar *hex_output = g_new0 (guchar, BASE16_ENCODE_LENGTH(padded_size) + 1);
	for (size_t i = 0; i < padded_size; i++)
        base16_encode_single (&hex_output[i * 2], padded_input[i]);

	g_free (padded_input);
	return (char*)hex_output;
}

