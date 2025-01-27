#pragma once
#include <cstdint>

class PidController
{
public:
	PidController(double min, double max, double kp, double kd, double ki);

	void setTarget(double target);
	void setBias(double bias);
	double correct(double value, double dt = 0.0);
	double getError(double value);

private:
	double calculateDt();

private:
	double _min, _max; 	  	 // PID bounds
	double _kp, _kd, _ki;    // PID gains
	double _dt, _tgt, _bias; // PID dt and target/bias
	double _int, _diff;		 // PID integral/diff
	double _err, _lerr;		 // PID error/last error
	std::int64_t _ltime;	 // PID last time
};
