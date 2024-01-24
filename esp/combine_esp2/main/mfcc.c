#include "mfcc.h"

const float window_func[FRAME_LEN] = WINDOW_FUNC;
const float twiddleCoef_rfft_1024[FRAME_LEN_PADDED] = TWIDDLECOEF_RFFT_1024;

float frame[FRAME_LEN_PADDED];
float spec_buffer[FRAME_LEN_PADDED];

static void stage_rfft_f32(float * p, float * pOut)
{
   uint32_t  k;
   float twR, twI;
   float * pCoeff = twiddleCoef_rfft_1024;
   float * pA = p;
   float * pB = p;
   float xAR, xAI, xBR, xBI;
   float t1a, t1b;
   float p0, p1, p2, p3;

   k = 512 - 1;

   xBR = pB[0];
   xBI = pB[1];
   xAR = pA[0];
   xAI = pA[1];

   twR = *pCoeff++ ;
   twI = *pCoeff++ ;

   t1a = xBR + xAR  ;

   t1b = xBI + xAI  ;

   *pOut++ = 0.5f * ( t1a + t1b );
   *pOut++ = 0.5f * ( t1a - t1b );

   pB  = p + 2*k;
   pA += 2;

   do
   {
		xBI = pB[1];
		xBR = pB[0];
		xAR = pA[0];
		xAI = pA[1];

		twR = *pCoeff++;
		twI = *pCoeff++;

		t1a = xBR - xAR;
		t1b = xBI + xAI;

		p0 = twR * t1a;
		p1 = twI * t1a;
		p2 = twR * t1b;
		p3 = twI * t1b;

		*pOut++ = 0.5f * (xAR + xBR + p0 + p3 );
		*pOut++ = 0.5f * (xAI - xBI + p1 - p2 );

		pA += 2;
		pB -= 2;
		k--;
   } while(k > 0u);
}

void mfcc_init() {
	esp_err_t ret;
	
	ret = dsps_fft2r_init_fc32(NULL, CONFIG_DSP_MAX_FFT_SIZE);
    if (ret != ESP_OK)
    {
        ESP_LOGE("esp-eye", "Not possible to initialize FFT. Error = %i", ret);
        return;
    }
}

void mfcc_compute(const int16_t * audio_data, float * freq_data) {
	int32_t i, j, bin;

	for (i = 0; i < FRAME_LEN; i++) {
		frame[i] = (float)audio_data[i] / (1 << 15); 
	}
	memset(&frame[FRAME_LEN], 0, sizeof(float) * (FRAME_LEN_PADDED - FRAME_LEN));

	for (i = 0; i < FRAME_LEN; i++) {
		frame[i] *= window_func[i];
	}
	
	dsps_fft2r_fc32(frame, FRAME_LEN_PADDED / 2);
	dsps_bit_rev_fc32(frame, FRAME_LEN_PADDED / 2);
	stage_rfft_f32(frame, spec_buffer);

	int32_t half_dim = FRAME_LEN_PADDED / 2;
	float first_energy = spec_buffer[0] * spec_buffer[0];
	float last_energy =  spec_buffer[1] * spec_buffer[1];
	for (i = 1; i < half_dim; i++) {
		float real = spec_buffer[i * 2];
		float im = spec_buffer[i * 2 + 1];
		spec_buffer[i] = real * real + im * im;
	}
	spec_buffer[0] = first_energy;
	spec_buffer[half_dim] = last_energy;

	for (i = 0; i < half_dim + 1; i++) {
		freq_data[i] = sqrtf(spec_buffer[i]);
	}
}
